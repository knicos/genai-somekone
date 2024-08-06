import { useProfilerService } from '@genaism/hooks/services';
import { findSimilarUsers, ProfilerService, UserNodeId, WeightedLabel, WeightedNode } from '@knicos/genai-recom';
import clusterUsers from '@knicos/genai-recom/helpers/clusterUsers';
import { useEffect, useRef, useState } from 'react';

function getSimilar(
    profiler: ProfilerService,
    id: UserNodeId,
    similarities: Map<UserNodeId, WeightedNode<UserNodeId>[]>
) {
    const s = findSimilarUsers(profiler.graph, profiler, id);
    similarities.set(
        id,
        s.filter((ss) => ss.weight > 0 && ss.id !== id)
    );
}

interface Result {
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>;
    topics?: Map<UserNodeId, WeightedLabel>;
}

export function useAllSimilarUsers(users: UserNodeId[], cluster?: boolean, k?: number): Result {
    const simRef = useRef(new Map<UserNodeId, WeightedNode<UserNodeId>[]>());
    const [result, setResult] = useState<Result>({ similar: simRef.current });
    const profiler = useProfilerService();

    useEffect(() => {
        users.forEach((c) => {
            getSimilar(profiler, c, simRef.current);
        });
        setResult({
            similar: simRef.current,
            topics: cluster ? clusterUsers(profiler, users, k || 2) : undefined,
        });
    }, [users, cluster, k, profiler]);

    useEffect(() => {
        const handler = (id: UserNodeId) => {
            getSimilar(profiler, id, simRef.current);
            setResult({
                similar: simRef.current,
                topics: cluster ? clusterUsers(profiler, users, k || 2) : undefined,
            });
        };
        profiler.broker.on('profile', handler);
        return () => {
            profiler.broker.off('profile', handler);
        };
    }, [users, cluster, k, profiler]);

    return result;
}
