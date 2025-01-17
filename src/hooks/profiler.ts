import { createEmptyProfile, UserNodeData, UserNodeId } from '@knicos/genai-recom';
import { useEffect, useMemo } from 'react';
import { useProfilerService } from './services';
import { useDebouncedState } from './debounce';

export function useUserProfile(id?: UserNodeId): UserNodeData {
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const [profile, setProfile] = useDebouncedState<UserNodeData | undefined>(undefined, 500);

    useEffect(() => {
        const handler = () => {
            try {
                setProfile({ ...profiler.getUserProfile(aid) });
            } catch (e) {
                console.error(e);
                setProfile(createEmptyProfile(aid, 'NoName'));
            }
        };
        handler();
        profiler.broker.on(`profile-${aid}`, handler);
        return () => profiler.broker.off(`profile-${aid}`, handler);
    }, [aid, profiler, setProfile]);
    return profile || createEmptyProfile(aid, 'NoName');
}

export function useSimilarUsers(profile: UserNodeData) {
    const profiler = useProfilerService();
    return useMemo(() => {
        return profiler
            .getSimilarUsers(profile.embeddings.taste, { count: 11 })
            .filter((s) => s.id !== profile.id && s.weight > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, profile.lastUpdated, profiler]);
}

export function useCurrentUser() {
    const profiler = useProfilerService();
    return profiler.getCurrentUser();
}
