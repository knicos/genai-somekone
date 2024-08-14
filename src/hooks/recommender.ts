import { RecommendationOptions, ScoredRecommendation, UserNodeId } from '@knicos/genai-recom';
import { useCallback, useEffect, useState } from 'react';
import { useServices } from './services';

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

export function useRecommendations(size: number, id?: UserNodeId, options?: RecommendationOptions): RecReturn {
    const { broker, profiler, recommender } = useServices();
    const aid = id || profiler.getCurrentUser();
    const [recommendations, setRecommendations] = useState<ScoredRecommendation[]>([]);

    useEffect(() => {
        const handler = () => {
            const newItems = recommender.getRecommendations(aid, size, options || DEFAULT_OPTIONS);
            setRecommendations([...newItems]);
        };
        broker.on(`recom-${aid}`, handler);
        recommender.generateNewRecommendations(aid, size, options || DEFAULT_OPTIONS, true);
        return () => broker.off(`recom-${aid}`, handler);
    }, [aid, broker, recommender, size, options]);

    const doMore = useCallback(() => {
        recommender.generateNewRecommendations(aid, size, options || DEFAULT_OPTIONS, true);
    }, [size, aid, recommender, options]);

    console.log('RECOM', recommendations);

    return {
        recommendations,
        more: doMore,
    };
}
