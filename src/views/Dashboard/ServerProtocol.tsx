import usePeer, { SenderType } from '@genaism/hooks/peer';
import { EventProtocol, UserEntry } from '@genaism/protocol/protocol';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { appConfiguration } from '@genaism/state/settingsState';
import { DataConnection } from 'peerjs';
import { useCallback, useEffect, useRef } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { SMConfig } from '../Genagram/smConfig';
import { appendActionLog, getActionLogSince } from '@genaism/services/profiler/logs';
import { getUserName, getUserProfile, setUserName, updateProfile } from '@genaism/services/profiler/profiler';
import { appendResearchLog } from '@genaism/services/research/research';
import { makeUserGraphSnapshot } from '@genaism/services/users/users';
import { addComment, getContentStats } from '@genaism/services/content/content';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { onlineUsers } from '@genaism/state/sessionState';
import ConnectionMonitor from '@genaism/components/ConnectionMonitor/ConnectionMonitor';

const MAX_AGE = 30 * 60 * 1000; // 30 mins

function getOfflineUsers(online: UserNodeId[]): UserEntry[] {
    const allUsers = getNodesByType('user');
    const set = new Set<UserNodeId>(online);
    const offline = allUsers.filter((u) => !set.has(u));
    const named = offline.map((u: UserNodeId) => ({ id: u, name: getUserName(u) }));
    return named.filter((u) => u.name !== '');
}

interface Props {
    onReady: (ready: boolean) => void;
    code: string;
    content?: (ArrayBuffer | string)[];
}

export default function ServerProtocol({ onReady, code, content }: Props) {
    const config = useRecoilValue<SMConfig>(appConfiguration);
    const snapRef = useRef(new Map<UserNodeId, number>());
    const senderRef = useRef<SenderType<EventProtocol> | undefined>();
    const [users, setUsers] = useRecoilState(onlineUsers);

    const dataHandler = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            if (data.event === 'eter:join') {
                conn.send({ event: 'eter:config', configuration: config, content });
                conn.send({
                    event: 'eter:users',
                    users: getOfflineUsers(users.map((u) => u.id)),
                });
            } else if (data.event === 'eter:reguser') {
                setUserName(data.id, data.username);
                setUsers((old) => [...old, { id: data.id, username: data.username, connection: conn }]);
                const profile = getUserProfile(data.id);
                conn.send({ event: 'eter:profile_data', profile, id: data.id });
                const logs = getActionLogSince(Date.now() - 3 * 60 * 60 * 1000, data.id);
                conn.send({ event: 'eter:action_log', log: logs, id: data.id });
            } else if (data.event === 'eter:close') {
                setUsers((old) => old.filter((o) => o.connection !== conn));
            } else if (data.event === 'eter:profile_data') {
                updateProfile(data.id, data.profile);
            } else if (data.event === 'eter:action_log') {
                appendActionLog(data.log, data.id);
                data.log.forEach((l) => {
                    if (l.activity === 'comment') {
                        if (senderRef.current) {
                            senderRef.current({
                                event: 'eter:comment',
                                id: data.id,
                                comment: l.content || '',
                                contentId: l.id || 'content:none',
                            });
                        }
                        addComment(l.id || 'content:none', data.id, l.content || '');
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
                const time = snapRef.current.get(data.id) || now - MAX_AGE;
                const snap = makeUserGraphSnapshot(data.id, now - time);
                snapRef.current.set(data.id, now);
                conn.send({ event: 'eter:snapshot', id: data.id, snapshot: snap });
            } else if (data.event === 'eter:recommendations') {
                // Send some updated statistics for these new recommendations
                conn.send({
                    event: 'eter:content_stats',
                    statistics: getContentStats(data.recommendations.map((r) => r.contentId)),
                });
            }
        },
        [config, content, users, setUsers]
    );
    const closeHandler = useCallback(
        (conn?: DataConnection) => {
            if (conn) {
                setUsers((old) => old.filter((o) => o.connection !== conn));
            }
        },
        [setUsers]
    );

    const { ready, send, status, error } = usePeer({ code: `sm-${code}`, onData: dataHandler, onClose: closeHandler });

    useEffect(() => {
        if (send) send({ event: 'eter:config', configuration: config });
        senderRef.current = send;
    }, [config, send]);

    useEffect(() => {
        onReady(ready);
    }, [onReady, ready]);

    return (
        <ConnectionMonitor
            ready={ready}
            status={status}
            error={error}
        />
    );
}
