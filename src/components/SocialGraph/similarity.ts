import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { addAnyProfileListener, removeAnyProfileListener } from '@genaism/services/profiler/events';
import { findSimilarUsers } from '@genaism/services/users/users';
import { useEffect, useRef, useState } from 'react';

export interface Similarities {
    nodes: WeightedNode<UserNodeId>[];
    maxSimilarity: number;
    minSimilarity: number;
    sumSimilarity: number;
}

export function useAllSimilarUsers(users: UserNodeId[]) {
    const simRef = useRef(new Map<UserNodeId, Similarities>());
    const [result, setResult] = useState({ similar: simRef.current });

    useEffect(() => {
        users.forEach((c) => {
            const s = findSimilarUsers(c);
            simRef.current.set(c, {
                nodes: s,
                maxSimilarity: s[0]?.weight || 0,
                minSimilarity: s[s.length - 1]?.weight || 0,
                sumSimilarity: s.reduce((sum, v) => sum + v.weight, 0),
            });
        });
        setResult({ similar: simRef.current });
    }, [users]);

    useEffect(() => {
        const handler = (id: UserNodeId) => {
            const s = findSimilarUsers(id);
            simRef.current.set(id, {
                nodes: s,
                maxSimilarity: s[0]?.weight || 0,
                minSimilarity: s[s.length - 1]?.weight || 0,
                sumSimilarity: s.reduce((sum, v) => sum + v.weight, 0),
            });
            setResult({ similar: simRef.current });
        };
        addAnyProfileListener(handler);
        return () => {
            removeAnyProfileListener(handler);
        };
    }, []);

    return result;
}
