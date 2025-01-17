import { UserNodeId, WeightedLabel, WeightedNode } from '@knicos/genai-recom';
import { useEffect, useState } from 'react';
import { useSimilarityService } from './services';

export interface SimilarityData {
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>;
    clusters: Map<UserNodeId, WeightedLabel>;
    users: UserNodeId[];
}

export function useSimilarityData(): SimilarityData {
    const service = useSimilarityService();
    const [data, setData] = useState<SimilarityData>(() => ({
        similar: service.getSimilar(),
        users: service.getUsers(),
        clusters: service.getClusters(),
    }));

    useEffect(() => {
        const h = () => {
            setData({
                similar: service.getSimilar(),
                users: service.getUsers(),
                clusters: service.getClusters(),
            });
        };

        service.on('updated', h);
        return () => {
            service.off('updated', h);
        };
    }, [service]);

    return data;
}
