import { addEdgeTypeListener, removeEdgeTypeListener } from '@genaism/services/graph/events';
import { ContentNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getRelated } from '@genaism/services/graph/query';
import { useEffect, useMemo, useReducer, useRef } from 'react';

interface Similarities {
    nodes: WeightedNode<ContentNodeId>[];
    maxSimilarity: number;
    minSimilarity: number;
}

export function contentSimilarity(id: ContentNodeId): WeightedNode<ContentNodeId>[] {
    const related = getRelated('coengaged', id, { count: 10 });
    return related;
}

export function useAllCoengagements(content: ContentNodeId[]) {
    const simRef = useRef(new Map<ContentNodeId, Similarities>());
    const [count, trigger] = useReducer((a) => ++a, 0);

    useEffect(() => {
        content.forEach((c) => {
            const s = contentSimilarity(c);
            let maxS = 0;
            let minS = 1000000;
            s.forEach((item) => {
                maxS = Math.max(maxS, item.weight);
                minS = Math.min(minS, item.weight);
            });
            simRef.current.set(c, { nodes: s, maxSimilarity: maxS, minSimilarity: minS });
        });
        trigger();
    }, [content]);

    useEffect(() => {
        const handler = (id: ContentNodeId) => {
            const s = contentSimilarity(id);
            let maxS = 0;
            let minS = 1000000;
            s.forEach((item) => {
                maxS = Math.max(maxS, item.weight);
                minS = Math.min(minS, item.weight);
            });
            simRef.current.set(id, { nodes: s, maxSimilarity: maxS, minSimilarity: minS });
            trigger();
        };
        addEdgeTypeListener('coengaged', handler);
        return () => {
            removeEdgeTypeListener('coengaged', handler);
        };
    }, []);

    return useMemo(() => ({ similar: simRef.current }), [count]);
}
