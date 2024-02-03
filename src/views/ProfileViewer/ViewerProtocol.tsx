import usePeer from '@genaism/hooks/peer';
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
import { SMConfig } from '../Genagram/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';
import ConnectionMonitor from '@genaism/components/ConnectionMonitor/ConnectionMonitor';
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
                replaceProfile(data.id, data.profile);
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
        code: server && `sm-${mycode}`,
        server: `sm-${server}`,
        onData,
    });

    useEffect(() => {
        if (username && send && ready) {
            window.sessionStorage.setItem(USERNAME_KEY, username);
            setUserName(getCurrentUser(), username);
            send({ event: 'eter:reguser', username, id: getCurrentUser() });
        }
    }, [username, send, ready]);

    return (
        <>
            {ready && <LogProvider sender={send}>{children}</LogProvider>}
            <ContentLoader content={content} />
            <ConnectionMonitor
                ready={ready}
                status={status}
                error={error}
            />
        </>
    );
}
