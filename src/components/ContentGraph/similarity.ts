import { addEdgeTypeListener, removeEdgeTypeListener } from '@genaism/services/graph/events';
import { ContentNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getRelated } from '@genaism/services/graph/query';
import { useEffect, useMemo, useReducer, useRef } from 'react';

export function contentSimilarity(id: ContentNodeId): WeightedNode<ContentNodeId>[] {
    const related = getRelated('coengaged', id, { count: 10 });
    return related;
}

export function useAllCoengagements(content: ContentNodeId[]) {
    const simRef = useRef(new Map<ContentNodeId, WeightedNode<ContentNodeId>[]>());
    const [count, trigger] = useReducer((a) => ++a, 0);

    useEffect(() => {
        content.forEach((c) => {
            const s = contentSimilarity(c);
            simRef.current.set(c, s);
        });
        trigger();
    }, [content]);

    useEffect(() => {
        const handler = (id: ContentNodeId) => {
            const s = contentSimilarity(id);
            simRef.current.set(id, s);
            trigger();
        };
        addEdgeTypeListener('coengaged', handler);
        return () => {
            removeEdgeTypeListener('coengaged', handler);
        };
    }, []);

    return useMemo(() => ({ similar: simRef.current }), [count]);
}
