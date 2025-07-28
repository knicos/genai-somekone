import { EventProtocol } from '@genaism/protocol/protocol';
import { currentUserName } from '@genaism/common/state/sessionState';
import { PropsWithChildren, useEffect, useState } from 'react';
import { useAtomValue, useSetAtom } from 'jotai';
import { appConfiguration } from '@genaism/common/state/configState';
import { LogProvider } from '@genaism/hooks/logger';
import { ContentLoader } from '@genaism/common/components/ContentLoader';
import { UserNodeId } from '@genai-fi/recom';
import { useServices } from '@genaism/hooks/services';
import { usePeerData, usePeerSender, usePeerStatus } from '@genai-fi/base/hooks/peer';

const USERNAME_KEY = 'genai_somekone_username';

interface Props extends PropsWithChildren {
    server?: string;
    mycode?: string;
    onID: (id: UserNodeId) => void;
}

export default function ViewerProtocol({ children, onID }: Props) {
    const setConfig = useSetAtom(appConfiguration);
    const username = useAtomValue<string | undefined>(currentUserName);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [loaded, setLoaded] = useState(false);
    const { profiler, recommender, actionLog } = useServices();

    usePeerData((data: EventProtocol) => {
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
    });

    const send = usePeerSender<EventProtocol>();
    const ready = usePeerStatus() === 'ready';

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
    }, [username, send, profiler, ready]);

    return (
        <>
            {ready && loaded && <LogProvider sender={send}>{children}</LogProvider>}
            <ContentLoader
                content={content}
                onLoaded={() => setLoaded(true)}
                noSession
            />
        </>
    );
}
