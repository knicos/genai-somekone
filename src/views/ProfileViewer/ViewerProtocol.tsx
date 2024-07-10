import { usePeer, ConnectionMonitor } from '@knicos/genai-base';
import { EventProtocol } from '@genaism/protocol/protocol';
import {
    appendActionLog,
    createUserProfile,
    getCurrentUser,
    replaceProfile,
    setUserName,
} from '@genaism/services/profiler/profiler';
import { currentUserName } from '@genaism/state/sessionState';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SMConfig } from '../../state/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';
import { LogProvider } from '@genaism/hooks/logger';
import { appendRecommendations } from '@genaism/services/recommender/recommender';
import ContentLoader from '@genaism/components/ContentLoader/ContentLoader';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

const USERNAME_KEY = 'genai_somekone_username';

interface Props extends PropsWithChildren {
    server?: string;
    mycode?: string;
    onID: (id: UserNodeId) => void;
}

export default function ViewerProtocol({ server, mycode, children, onID }: Props) {
    const setConfig = useSetRecoilState<SMConfig>(appConfiguration);
    const username = useRecoilValue<string | undefined>(currentUserName);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [loaded, setLoaded] = useState(false);

    const onData = useCallback(
        (data: EventProtocol) => {
            if (data.event === 'eter:reguser') {
                try {
                    createUserProfile(data.id, data.username);
                } catch (e) {
                    console.warn(e);
                }
                onID(data.id);
            } else if (data.event === 'eter:profile_data') {
                try {
                    replaceProfile(data.id, data.profile);
                } catch (e) {
                    // Ignore
                }
            } else if (data.event === 'eter:action_log') {
                appendActionLog(data.log, data.id);
            } else if (data.event === 'eter:recommendations') {
                appendRecommendations(data.id, data.recommendations);
            } else if (data.event === 'eter:config') {
                setConfig((old) => ({ ...old, ...data.configuration }));
                if (data.content) {
                    setContent(data.content);
                }
            }
        },
        [setConfig, onID]
    );

    const { ready, send, status, error } = usePeer<EventProtocol>({
        host: import.meta.env.VITE_APP_PEER_SERVER,
        secure: import.meta.env.VITE_APP_PEER_SECURE === '1',
        key: import.meta.env.VITE_APP_PEER_KEY || 'peerjs',
        port: import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443,
        code: server && `sm-${mycode}`,
        server: `sm-${server}`,
        onData,
    });

    useEffect(() => {
        if (username && send && ready) {
            try {
                window.sessionStorage.setItem(USERNAME_KEY, username);
            } catch (e) {
                // Ignore this
            }
            setUserName(getCurrentUser(), username);
            send({ event: 'eter:reguser', username, id: getCurrentUser() });
        }
    }, [username, send, ready]);

    return (
        <>
            {ready && loaded && <LogProvider sender={send}>{children}</LogProvider>}
            <ContentLoader
                content={content}
                onLoaded={() => setLoaded(true)}
            />
            <ConnectionMonitor
                api={import.meta.env.VITE_APP_APIURL}
                appName="somekone"
                ready={ready}
                status={status}
                error={error}
            />
        </>
    );
}
