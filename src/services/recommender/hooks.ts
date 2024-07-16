import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { UserNodeId } from '../graph/graphTypes';
import { getCurrentUser } from '../profiler/profiler';
import { RecommendationOptions, ScoredRecommendation } from './recommenderTypes';
import { addRecommendationListener, removeRecommendationListener } from './events';
import { generateNewRecommendations, getRecommendations } from '@genaism/services/recommender/recommender';

interface RecReturn {
    more: () => void;
    recommendations: ScoredRecommendation[];
}

const DEFAULT_OPTIONS: RecommendationOptions = {
    random: 2,
    taste: 2,
    coengaged: 2,
    similarUsers: 2,
    popular: 2,
};

interface InternalState {
    options: RecommendationOptions;
    size: number;
    id: UserNodeId;
}

export function useRecommendations(size: number, id?: UserNodeId, options?: RecommendationOptions): RecReturn {
    const aid = id || getCurrentUser();
    const optRef = useRef<InternalState>({
        options: options || DEFAULT_OPTIONS,
        id: aid,
        size: size,
    });
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addRecommendationListener(aid, handler);
        return () => removeRecommendationListener(aid, handler);
    }, [aid]);

    useEffect(() => {
        optRef.current.id = aid;
        optRef.current.size = size;
    }, [aid, size]);

    useEffect(() => {
        optRef.current.options = options || DEFAULT_OPTIONS;
        generateNewRecommendations(optRef.current.id, optRef.current.size, optRef.current.options, true);
    }, [options]);

    const doMore = useCallback(() => {
        generateNewRecommendations(aid, size, optRef.current.options, true);
    }, [size, aid]);

    return useMemo(
        () => ({
            recommendations: getRecommendations(aid, size, optRef.current.options),
            more: doMore,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [aid, count, size, doMore]
    );
}
