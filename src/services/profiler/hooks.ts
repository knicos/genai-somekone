import { useEffect, useMemo, useReducer } from 'react';
import { UserProfile } from './profilerTypes';
import { getCurrentUser, getUserProfile } from './profiler';
import { addProfileListener, removeProfileListener } from './events';

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
