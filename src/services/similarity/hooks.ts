import { useMemo } from 'react';
import { UserNodeData } from '../users/userTypes';
import { getSimilarUsers } from './user';

export function useSimilarUsers(profile: UserNodeData) {
    return useMemo(() => {
        return getSimilarUsers(profile.embeddings.taste, 11).filter((s) => s.id !== profile.id && s.weight > 0);
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [profile, profile.lastUpdated]);
}
