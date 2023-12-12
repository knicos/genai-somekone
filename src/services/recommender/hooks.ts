import { useCallback, useEffect, useMemo, useReducer } from 'react';
import { UserNodeId } from '../graph/graphTypes';
import { getCurrentUser } from '../profiler/profiler';
import { ScoredRecommendation } from './recommenderTypes';
import { addRecommendationListener, removeRecommendationListener } from './events';
import { generateNewRecommendations, getRecommendations } from '@genaism/services/recommender/recommender';

interface RecReturn {
    more: () => void;
    recommendations: ScoredRecommendation[];
}

export function useRecommendations(size: number, id?: UserNodeId): RecReturn {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addRecommendationListener(aid, handler);
        return () => removeRecommendationListener(aid, handler);
    }, [aid]);

    const doMore = useCallback(() => generateNewRecommendations(aid, size), [size]);

    return useMemo(
        () => ({
            recommendations: getRecommendations(aid, size),
            more: doMore,
        }),
        [aid, count, size]
    );
}
