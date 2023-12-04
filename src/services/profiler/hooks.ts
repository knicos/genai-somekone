import { useEffect, useMemo, useReducer } from 'react';
import { LogEntry, UserProfile } from './profilerTypes';
import { getActionLog, getCurrentUser, getUserProfile } from './profiler';
import { addLogListener, addProfileListener, removeLogListener, removeProfileListener } from './events';

export function useUserProfile(id?: string): UserProfile {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addProfileListener(aid, handler);
        return () => removeProfileListener(aid, handler);
    }, [aid]);
    return useMemo(() => getUserProfile(aid), [aid, count]);
}

export function useActionLog(id?: string): LogEntry[] {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addLogListener(aid, handler);
        return () => removeLogListener(aid, handler);
    }, [aid]);
    return useMemo(
        () =>
            getActionLog(id)
                .filter((a) => !!a.id)
                .reverse(),
        [count, aid]
    );
}
