import usePeer from '@genaism/hooks/peer';
import { EventProtocol } from '@genaism/protocol/protocol';
import { addComment, updateContentStats } from '@genaism/services/content/content';
import { addEdges } from '@genaism/services/graph/edges';
import { addNodes } from '@genaism/services/graph/nodes';
import {
    appendActionLog,
    getActionLogSince,
    getCurrentUser,
    getUserProfile,
    setBestEngagement,
    setUserName,
    updateProfile,
} from '@genaism/services/profiler/profiler';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { availableUsers, currentUserName } from '@genaism/state/sessionState';
import { DataConnection } from 'peerjs';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { SMConfig } from '../../state/smConfig';
import { appConfiguration } from '@genaism/state/settingsState';
import ConnectionMonitor from '@genaism/components/ConnectionMonitor/ConnectionMonitor';
import { LogProvider } from '@genaism/hooks/logger';
import { getRecommendations } from '@genaism/services/recommender/recommender';

const DATA_LOG_TIME = 15 * 60 * 1000;
const USERNAME_KEY = 'genai_somekone_username';

interface ProtocolContextType {
    doProfile?: (profile: UserProfile) => void;
    doRecommend?: (recommendations: ScoredRecommendation[]) => void;
    doLog?: () => void;
}

const ProtocolContext = createContext<ProtocolContextType>({});

interface Props extends PropsWithChildren {
    server?: string;
    mycode?: string;
    content?: (string | ArrayBuffer)[];
    setContent: (v: (string | ArrayBuffer)[]) => void;
}

export function useFeedProtocol() {
    return useContext(ProtocolContext);
}

export default function FeedProtocol({ content, server, mycode, setContent, children }: Props) {
    const logRef = useRef(0);
    const logTimer = useRef(-1);
    const setAvailableUsers = useSetRecoilState(availableUsers);
    const [config, setConfig] = useRecoilState<SMConfig>(appConfiguration);
    const username = useRecoilValue<string | undefined>(currentUserName);
    const hasBeenConnected = useRef(false);
    const [hasBeenReady, setHasBeenReady] = useState(false);

    const onData = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            if (data.event === 'eter:config' && data.configuration) {
                setConfig((old) => ({ ...old, ...data.configuration }));
                if (data.content) setContent && setContent(data.content);
            } else if (data.event === 'eter:users') {
                setAvailableUsers(data.users);
            } else if (data.event === 'eter:profile_data') {
                if (hasBeenConnected.current) {
                    console.info('Skipping profile update');
                    return;
                }
                updateProfile(data.id, data.profile);
            } else if (data.event === 'eter:action_log') {
                if (hasBeenConnected.current) return;
                hasBeenConnected.current = true;
                appendActionLog(data.log, data.id);
            } else if (data.event === 'eter:comment') {
                addComment(data.contentId, data.id, data.comment, data.timestamp);
            } else if (data.event === 'eter:join') {
                const profile = getUserProfile();
                const logs = getActionLogSince(Date.now() - DATA_LOG_TIME).filter((a) => a.timestamp <= logRef.current);
                const recommendations = getRecommendations(getCurrentUser(), 5, config.recommendations);
                conn.send({ event: 'eter:config', configuration: config, content });
                conn.send({ event: 'eter:reguser', username, id: getCurrentUser() });
                conn.send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
                conn.send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
                conn.send({ event: 'eter:recommendations', recommendations, id: getCurrentUser() });
                conn.send({ event: 'eter:connect', code: `sm-${server}` });
            } else if (data.event === 'eter:snapshot' && data.snapshot) {
                addNodes(data.snapshot.nodes);
                addEdges(data.snapshot.edges.map((e) => ({ ...e, timestamp: Date.now(), metadata: {} })));
            } else if (data.event === 'eter:stats') {
                updateContentStats(data.content);
                setBestEngagement(data.bestEngagement);
            }
        },
        [config, username, content, server, setConfig, setAvailableUsers, setContent]
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

    const doLog = useCallback(() => {
        if (send && logTimer.current === -1) {
            logTimer.current = window.setTimeout(() => {
                logTimer.current = -1;
                const logs = getActionLogSince(logRef.current);
                logRef.current = Date.now();
                send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
            }, 500);
        }
    }, [send]);

    const doProfile = useCallback(
        (profile: UserProfile) => {
            if (send) {
                send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
            }
        },
        [send]
    );

    const doRecommend = useCallback(
        (recommendations: ScoredRecommendation[]) => {
            if (send) {
                send({ event: 'eter:recommendations', recommendations, id: getCurrentUser() });
                send({ event: 'eter:snapshot', id: getCurrentUser() });
            }
        },
        [send]
    );

    useEffect(() => {
        setHasBeenReady(true);
    }, [ready]);

    return (
        <ProtocolContext.Provider
            value={{
                doRecommend,
                doLog,
                doProfile,
            }}
        >
            {hasBeenReady && <LogProvider sender={send}>{children}</LogProvider>}
            <ConnectionMonitor
                ready={ready}
                status={status}
                error={error}
            />
        </ProtocolContext.Provider>
    );
}
