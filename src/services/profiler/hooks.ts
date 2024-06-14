import { useEffect, useMemo, useReducer } from 'react';
import { getCurrentUser, getUserProfile } from './profiler';
import { addProfileListener, removeProfileListener } from './events';
import { UserNodeId } from '../graph/graphTypes';
import { UserNodeData } from '../users/userTypes';

export function useUserProfile(id?: UserNodeId): UserNodeData {
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
