import { RecommendationOptions, ScoredRecommendation, UserNodeId } from '@knicos/genai-recom';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import { useBroker, useProfilerService, useRecommenderService } from './services';

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
    const broker = useBroker();
    const profiler = useProfilerService();
    const recommender = useRecommenderService();
    const aid = id || profiler.getCurrentUser();
    const optRef = useRef<InternalState>({
        options: options || DEFAULT_OPTIONS,
        id: aid,
        size: size,
    });
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`recom-${aid}`, handler);
        return () => broker.off(`recom-${aid}`, handler);
    }, [aid, broker]);

    useEffect(() => {
        optRef.current.id = aid;
        optRef.current.size = size;
    }, [aid, size]);

    useEffect(() => {
        optRef.current.options = options || DEFAULT_OPTIONS;
        recommender.generateNewRecommendations(optRef.current.id, optRef.current.size, optRef.current.options, true);
    }, [options, recommender]);

    const doMore = useCallback(() => {
        recommender.generateNewRecommendations(aid, size, optRef.current.options, true);
    }, [size, aid, recommender]);

    return useMemo(
        () => ({
            recommendations: recommender.getRecommendations(aid, size, optRef.current.options),
            more: doMore,
        }),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [aid, count, size, doMore, recommender]
    );
}
