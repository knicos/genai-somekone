import { usePeer, ConnectionStatus } from '@knicos/genai-base';
import { EventProtocol } from '@genaism/protocol/protocol';
import { currentUserName } from '@genaism/state/sessionState';
import { PropsWithChildren, useCallback, useEffect, useState } from 'react';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { SMConfig } from '../../state/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';
import { LogProvider } from '@genaism/hooks/logger';
import { ContentLoader } from '@genaism/components/ContentLoader';
import { UserNodeId } from '@knicos/genai-recom';
import { useServices } from '@genaism/hooks/services';

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
    const { profiler, recommender, actionLog } = useServices();

    const onData = useCallback(
        (data: EventProtocol) => {
            if (data.event === 'eter:reguser') {
                try {
                    profiler.createUserProfile(data.id, data.username);
                } catch (e) {
                    console.warn(e);
                }
                onID(data.id);
            } else if (data.event === 'eter:profile_data') {
                try {
                    profiler.replaceProfile(data.id, data.profile);
                } catch (e) {
                    // Ignore
                }
            } else if (data.event === 'eter:action_log') {
                actionLog.appendActionLog(data.log, data.id);
            } else if (data.event === 'eter:recommendations') {
                recommender.appendRecommendations(data.id, data.recommendations);
            } else if (data.event === 'eter:config') {
                setConfig((old) => ({ ...old, ...data.configuration }));
                if (data.content) {
                    setContent(data.content);
                }
            }
        },
        [setConfig, onID, profiler, actionLog, recommender]
    );

    const { ready, send, peer } = usePeer<EventProtocol>({
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
            profiler.setUserName(profiler.getCurrentUser(), username);
            send({ event: 'eter:reguser', username, id: profiler.getCurrentUser() });
        }
    }, [username, send, ready, profiler]);

    return (
        <>
            {ready && loaded && <LogProvider sender={send}>{children}</LogProvider>}
            <ContentLoader
                content={content}
                onLoaded={() => setLoaded(true)}
            />
            <ConnectionStatus
                api={import.meta.env.VITE_APP_APIURL}
                appName={import.meta.env.DEV ? 'dev' : 'somekone'}
                ready={ready}
                peer={peer}
            />
        </>
    );
}
