import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { addAnyProfileListener, removeAnyProfileListener } from '@genaism/services/profiler/events';
import { findSimilarUsers } from '@genaism/services/users/users';
import { useEffect, useRef, useState } from 'react';
import { clusterUsers } from './cluster';

function getSimilar(id: UserNodeId, similarities: Map<UserNodeId, WeightedNode<UserNodeId>[]>) {
    const s = findSimilarUsers(id);
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

    useEffect(() => {
        users.forEach((c) => {
            getSimilar(c, simRef.current);
        });
        setResult({
            similar: simRef.current,
            topics: cluster ? clusterUsers(users, k || 2) : undefined,
        });
    }, [users, cluster, k]);

    useEffect(() => {
        const handler = (id: UserNodeId) => {
            getSimilar(id, simRef.current);
            setResult({
                similar: simRef.current,
                topics: cluster ? clusterUsers(users, k || 2) : undefined,
            });
        };
        addAnyProfileListener(handler);
        return () => {
            removeAnyProfileListener(handler);
        };
    }, [users, cluster, k]);

    return result;
}
