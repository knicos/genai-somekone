import { UserNodeData, UserNodeId } from '@knicos/genai-recom';
import { useEffect, useMemo, useReducer } from 'react';
import { useBroker, useProfilerService } from './services';

export function useUserProfile(id?: UserNodeId): UserNodeData {
    const broker = useBroker();
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`profile-${aid}`, handler);
        return () => broker.off(`profile-${aid}`, handler);
    }, [aid, broker]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => profiler.getUserProfile(aid), [aid, count]);
}

export function useSimilarUsers(profile: UserNodeData) {
    const profiler = useProfilerService();
    return useMemo(() => {
        return profiler
            .getSimilarUsers(profile.embeddings.taste, 11)
            .filter((s) => s.id !== profile.id && s.weight > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, profile.lastUpdated, profiler]);
}

export function useCurrentUser() {
    const profiler = useProfilerService();
    return profiler.getCurrentUser();
}
