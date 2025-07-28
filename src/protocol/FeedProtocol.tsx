import { Connection } from '@genai-fi/base';
import { EventProtocol } from '@genaism/protocol/protocol';
import { availableUsers, currentUserName, injectedContent } from '@genaism/common/state/sessionState';
import { PropsWithChildren, createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { SMConfig } from '../common/state/smConfig';
import { appConfiguration } from '@genaism/common/state/configState';
import { LogProvider } from '@genaism/hooks/logger';
import { decompressFromUTF16 } from 'lz-string';
import { ContentNodeId, ScoredRecommendation, Snapshot, UserNodeData } from '@genai-fi/recom';
import { useServices } from '@genaism/hooks/services';
import { bytesToBase64DataUrl, dataUrlToBytes } from '@genaism/util/base64';
import ConnectionStatus from '@genaism/common/components/ConnectionStatus/ConnectionStatus';
import { usePeerData, usePeerSender, usePeerStatus } from '@genai-fi/base/hooks/peer';

const DATA_LOG_TIME = 15 * 60 * 1000;
const USERNAME_KEY = 'genai_somekone_username';

interface ProtocolContextType {
    doProfile?: (profile: UserNodeData) => void;
    doRecommend?: (recommendations: ScoredRecommendation[]) => void;
    doLog?: () => void;
}

const ProtocolContext = createContext<ProtocolContextType>({});

interface Props extends PropsWithChildren {
    server?: string;
    content?: (string | ArrayBuffer)[];
    setContent: (v: (string | ArrayBuffer)[]) => void;
}

export function useFeedProtocol() {
    return useContext(ProtocolContext);
}

export default function FeedProtocol({ content, server, setContent, children }: Props) {
    const logRef = useRef(Date.now());
    const logTimer = useRef(-1);
    const setAvailableUsers = useSetAtom(availableUsers);
    const [config, setConfig] = useAtom<SMConfig>(appConfiguration);
    const setInjected = useSetAtom(injectedContent);
    const username = useAtomValue<string | undefined>(currentUserName);
    const hasBeenConnected = useRef(false);
    const [hasBeenReady, setHasBeenReady] = useState(false);
    const { content: contentSvc, profiler: profilerSvc, actionLog, recommender } = useServices();

    usePeerData((data: EventProtocol, conn: Connection<EventProtocol>) => {
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
            profilerSvc.reverseProfile(data.id, data.profile);
        } else if (data.event === 'eter:action_log') {
            if (hasBeenConnected.current) return;
            hasBeenConnected.current = true;
            actionLog.appendActionLog(data.log, data.id);
        } else if (data.event === 'eter:comment') {
            contentSvc.addComment(data.contentId, data.id, data.comment, data.timestamp);
        } else if (data.event === 'eter:join') {
            const profile = profilerSvc.getUserProfile();
            const logs = actionLog
                .getActionLogSince(Date.now() - DATA_LOG_TIME, profilerSvc.getCurrentUser())
                .filter((a) => a.timestamp <= logRef.current);
            const recommendations = recommender.getRecommendations(
                profilerSvc.getCurrentUser(),
                5,
                config.recommendations
            );
            conn.send({ event: 'eter:config', configuration: config, content });
            conn.send({ event: 'eter:reguser', username: username || 'NoName', id: profilerSvc.getCurrentUser() });
            conn.send({ event: 'eter:action_log', id: profilerSvc.getCurrentUser(), log: logs });
            conn.send({ event: 'eter:profile_data', profile, id: profilerSvc.getCurrentUser() });
            conn.send({ event: 'eter:recommendations', recommendations, id: profilerSvc.getCurrentUser() });
            conn.send({ event: 'eter:connect', code: `sm-${server}` });
        } else if (data.event === 'eter:inject') {
            if (data.to === profilerSvc.getCurrentUser()) {
                setInjected((old) => [{ ...data, timestamp: Date.now() }, ...old.slice(0, 5)]);
            }
        } else if (data.event === 'eter:newpost') {
            if (data.data) {
                bytesToBase64DataUrl(data.data).then((base64) => {
                    if (!contentSvc.hasContent(`content:${data.meta.id}`)) {
                        contentSvc.addContent(base64, data.meta);
                    } else {
                        contentSvc.addContentData(base64, data.meta);
                    }
                });
            } else {
                contentSvc.addContentMeta(data.meta);
            }
        } else if (data.event === 'eter:snapshot' && data.snapshot) {
            const snap = data.compressed
                ? (JSON.parse(decompressFromUTF16(data.snapshot as string)) as Snapshot)
                : (data.snapshot as Snapshot);

            profilerSvc.graph.addNodes(snap.nodes);
            profilerSvc.graph.addEdges(snap.edges.map((e) => ({ ...e, timestamp: Date.now(), metadata: {} })));
            snap.logs?.forEach((log) => {
                if (log.user !== profilerSvc.getCurrentUser()) {
                    actionLog.addLogEntry(log.entry, log.user);
                }
            });
        } else if (data.event === 'eter:stats') {
            contentSvc.updateContentStats(data.content);
            profilerSvc.setBestEngagement(data.bestEngagement);
        }
    });

    const send = usePeerSender<EventProtocol>();
    const ready = usePeerStatus() === 'ready';

    useEffect(() => {
        if (username && send && ready) {
            window.sessionStorage.setItem(USERNAME_KEY, username);
            profilerSvc.setUserName(profilerSvc.getCurrentUser(), username);
            send({ event: 'eter:reguser', username, id: profilerSvc.getCurrentUser() });
            send({ event: 'eter:snapshot', id: profilerSvc.getCurrentUser() });
        }
    }, [username, send, ready, profilerSvc]);

    const doLog = useCallback(() => {
        /*if (send && logTimer.current === -1) {
            logTimer.current = window.setTimeout(() => {
                logTimer.current = -1;
                const logs = actionLog.getActionLogSince(logRef.current, profilerSvc.getCurrentUser());
                logRef.current = Date.now();
                send({ event: 'eter:action_log', id: profilerSvc.getCurrentUser(), log: logs });
            }, 500);
        }*/
    }, []);

    const doProfile = useCallback(
        (profile: UserNodeData) => {
            if (send) {
                send({ event: 'eter:profile_data', profile, id: profilerSvc.getCurrentUser() });
            }
        },
        [send, profilerSvc]
    );

    const doRecommend = useCallback(
        (recommendations: ScoredRecommendation[]) => {
            if (send) {
                send({ event: 'eter:recommendations', recommendations, id: profilerSvc.getCurrentUser() });
                send({ event: 'eter:snapshot', id: profilerSvc.getCurrentUser() });
            }
        },
        [send, profilerSvc]
    );

    useEffect(() => {
        setHasBeenReady(true);
    }, [ready]);

    useEffect(() => {
        const postHandler = (cid: ContentNodeId) => {
            const uid = profilerSvc.getCurrentUser();
            const meta = contentSvc.getContentMetadata(cid);
            const data = contentSvc.getContentData(cid);
            if (send && meta && data && meta.authorId === uid) {
                dataUrlToBytes(data).then((binaryData) => {
                    send({ event: 'eter:newpost', meta, data: binaryData });
                });
            }
        };
        const missingHandler = (cid: ContentNodeId) => {
            if (send && contentSvc.hasContent(cid)) {
                send({ event: 'eter:request_content', id: cid });
            }
        };
        const logHandler = () => {
            if (send) {
                if (send && logTimer.current === -1) {
                    logTimer.current = window.setTimeout(() => {
                        logTimer.current = -1;
                        const logs = actionLog.getActionLogSince(logRef.current, profilerSvc.getCurrentUser());
                        logRef.current = Date.now();
                        send({ event: 'eter:action_log', id: profilerSvc.getCurrentUser(), log: logs });
                    }, 500);
                }
            }
        };

        contentSvc.broker.on('posted', postHandler);
        contentSvc.broker.on('contentmissing', missingHandler);
        actionLog.broker.on('logdata-engagement', logHandler);
        actionLog.broker.on('logdata-comment', logHandler);
        //actionLog.broker.on('logdata-share_public', logHandler);
        return () => {
            contentSvc.broker.off('posted', postHandler);
            contentSvc.broker.off('contentmissing', missingHandler);
            contentSvc.broker.off('logdata-engagement', logHandler);
            contentSvc.broker.off('logdata-comment', logHandler);
            //contentSvc.broker.off('logdata-share_public', logHandler);
        };
    }, [contentSvc, send, profilerSvc, actionLog]);

    return (
        <ProtocolContext.Provider
            value={{
                doRecommend,
                doLog,
                doProfile,
            }}
        >
            {hasBeenReady && <LogProvider sender={send}>{children}</LogProvider>}
            <ConnectionStatus
                position="center"
                visibility={0}
            />
        </ProtocolContext.Provider>
    );
}
