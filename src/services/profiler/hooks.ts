import { useEffect, useMemo, useReducer } from 'react';
import { LogEntry, UserProfile } from './profilerTypes';
import { getActionLog, getCurrentUser, getUserProfile } from './profiler';
import { addLogListener, addProfileListener, removeLogListener, removeProfileListener } from './events';
import { UserNodeId } from '../graph/graphTypes';

export function useUserProfile(id?: UserNodeId): UserProfile {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addProfileListener(aid, handler);
        return () => removeProfileListener(aid, handler);
    }, [aid]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => getUserProfile(aid), [aid, count]);
}

export function useActionLog(id?: UserNodeId): LogEntry[] {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addLogListener(aid, handler);
        return () => removeLogListener(aid, handler);
    }, [aid]);
    return useMemo(
        () =>
            getActionLog(aid)
                .filter((a) => !!a.id)
                .reverse(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [count, aid]
    );
}
