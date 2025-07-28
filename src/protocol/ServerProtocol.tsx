import { SenderType } from '@genai-fi/base';
import { EventProtocol, UserEntry } from '@genaism/protocol/protocol';
import { appConfiguration } from '@genaism/common/state/configState';
import { useEffect, useRef } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import { SMConfig } from '../common/state/smConfig';
import { compressToUTF16 } from 'lz-string';
import { appendResearchLog } from '@genaism/services/research/research';
import { onlineUsers } from '@genaism/common/state/sessionState';
import { ContentNodeId, makeUserSnapshot, ProfilerService, UserNodeId } from '@genai-fi/recom';
import { useServices } from '@genaism/hooks/services';
import { bytesToBase64DataUrl, dataUrlToBytes } from '@genaism/util/base64';
import { Connection } from '@genai-fi/base/main/services/peer2peer/types';
import ConnectionStatus from '@genaism/common/components/ConnectionStatus/ConnectionStatus';
import { usePeerClose, usePeerData, usePeerSender, usePeerStatus } from '@genai-fi/base/hooks/peer';

const MAX_AGE = 30 * 60 * 1000; // 30 mins

function getOfflineUsers(profiler: ProfilerService, online: UserNodeId[]): UserEntry[] {
    const allUsers = profiler.graph.getNodesByType('user');
    const set = new Set<UserNodeId>(online);
    const offline = allUsers.filter((u) => !set.has(u));
    const named = offline.map((u: UserNodeId) => ({ id: u, name: profiler.getUserName(u) }));
    return named.filter((u) => u.name !== '');
}

interface Props {
    onReady: (ready: boolean) => void;
    content?: (ArrayBuffer | string)[];
}

export default function ServerProtocol({ onReady, content }: Props) {
    const config = useAtomValue<SMConfig>(appConfiguration);
    const snapRef = useRef(new Map<UserNodeId, number>());
    const senderRef = useRef<SenderType<EventProtocol> | undefined>(undefined);
    const [users, setUsers] = useAtom(onlineUsers);
    const { content: contentSvc, profiler: profilerSvc, actionLog } = useServices();
    const postCache = useRef(new Set<ContentNodeId>());

    usePeerData((data: EventProtocol, conn: Connection<EventProtocol>) => {
        if (data.event === 'eter:join') {
            conn.send({ event: 'eter:config', configuration: config, content });
            conn.send({
                event: 'eter:users',
                users: getOfflineUsers(
                    profilerSvc,
                    users.map((u) => u.id)
                ),
            });
        } else if (data.event === 'eter:reguser') {
            profilerSvc.setUserName(data.id, data.username);
            snapRef.current.delete(data.id);
            setUsers((old) => [...old, { id: data.id, username: data.username, connection: conn }]);
            const profile = profilerSvc.getUserProfile(data.id);
            conn.send({ event: 'eter:profile_data', profile, id: data.id });
            const logs = actionLog.getActionLogSince(Date.now() - 3 * 60 * 60 * 1000, data.id);
            conn.send({ event: 'eter:action_log', log: logs, id: data.id });
        } else if (data.event === 'eter:close') {
            setUsers((old) => old.filter((o) => o.connection !== conn));
        } else if (data.event === 'eter:profile_data') {
            profilerSvc.reverseProfile(data.id, data.profile);
        } else if (data.event === 'eter:request_content') {
            const meta = contentSvc.getContentMetadata(data.id);
            const contentData = contentSvc.getContentData(data.id);
            if (meta && contentData) {
                dataUrlToBytes(contentData).then((binaryData) => {
                    conn.send({
                        event: 'eter:newpost',
                        meta,
                        data: binaryData,
                    });
                });
            }
        } else if (data.event === 'eter:newpost') {
            const cid: ContentNodeId = `content:${data.meta.id}`;
            if (data.data) {
                bytesToBase64DataUrl(data.data).then((base64) => {
                    if (!contentSvc.hasContent(cid)) {
                        contentSvc.addContent(base64, data.meta);
                    } else {
                        contentSvc.addContentData(base64, data.meta);
                    }
                });
            } else {
                contentSvc.addContentMeta(data.meta);
            }

            postCache.current.add(cid);

            // Must forward it to everyone except the poster.
            if (senderRef.current) {
                senderRef.current({ event: 'eter:newpost', meta: data.meta }, [conn.connectionId]);
            }
        } else if (data.event === 'eter:action_log') {
            actionLog.appendActionLog(data.log, data.id);
            data.log.forEach((l) => {
                if (l.activity === 'comment') {
                    if (senderRef.current) {
                        senderRef.current({
                            event: 'eter:comment',
                            id: data.id,
                            comment: l.content || '',
                            contentId: l.id || 'content:none',
                            timestamp: l.timestamp,
                        });
                    }
                    contentSvc.addComment(l.id || 'content:none', data.id, l.content || '', l.timestamp);
                } else if (l.activity === 'share_public' && l.user && l.id) {
                    // TODO: Send only to target user
                    if (senderRef.current) {
                        senderRef.current(
                            { event: 'eter:inject', reason: 'share', content: l.id, from: data.id, to: l.user },
                            [conn.connectionId]
                        );
                    }
                }
            });
        } else if (data.event === 'researchlog') {
            appendResearchLog({
                action: data.action,
                timestamp: data.timestamp,
                details: data.details,
                userId: data.userId,
            });
        } else if (data.event === 'eter:snapshot') {
            const now = Date.now();
            const timeEntry = snapRef.current.get(data.id);
            const time = timeEntry || now - MAX_AGE;
            const snap = makeUserSnapshot(profilerSvc.graph, actionLog, data.id, time, !timeEntry);
            snapRef.current.set(data.id, now);
            const compressed = now - time > 5 * 60 * 1000;
            conn.send({
                event: 'eter:snapshot',
                id: data.id,
                snapshot: compressed ? compressToUTF16(JSON.stringify(snap)) : snap,
                compressed,
            });

            // First snapshot
            if (!timeEntry) {
                // Send all posted content metadata
                postCache.current.forEach((c) => {
                    const meta = contentSvc.getContentMetadata(c);
                    if (meta) {
                        conn.send({ event: 'eter:newpost', meta });
                    }
                });
            }
        } else if (data.event === 'eter:recommendations') {
            // Send some updated statistics for these new recommendations
            conn.send({
                event: 'eter:stats',
                content: contentSvc
                    .getContentStats(data.recommendations.map((r) => r.contentId))
                    .map((s, ix) => ({ ...s, id: data.recommendations[ix].contentId })),
                bestEngagement: profilerSvc.getBestEngagement(),
            });
        }
    });
    usePeerClose((conn?: Connection<EventProtocol>) => {
        if (conn) {
            setUsers((old) => old.filter((o) => o.connection.connectionId !== conn.connectionId));
        }
    });

    const send = usePeerSender<EventProtocol>();
    const ready = usePeerStatus() === 'ready';

    useEffect(() => {
        if (send) send({ event: 'eter:config', configuration: config });
        senderRef.current = send;
    }, [config, send]);

    useEffect(() => {
        onReady(ready);
    }, [onReady, ready]);

    return <ConnectionStatus position="corner" />;
}
