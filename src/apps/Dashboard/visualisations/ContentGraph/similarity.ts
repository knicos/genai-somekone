import { useBroker, useGraphService } from '@genaism/hooks/services';
import { ContentNodeId, GraphService, NodeID, WeightedNode } from '@knicos/genai-recom';
import { useEffect, useMemo, useReducer, useRef } from 'react';

interface Similarities {
    nodes: WeightedNode<ContentNodeId>[];
    maxSimilarity: number;
    minSimilarity: number;
}

export function contentSimilarity(graph: GraphService, id: ContentNodeId): WeightedNode<ContentNodeId>[] {
    const related = graph.getRelated('coengaged', id, { count: 10 });
    return related;
}

export function useAllCoengagements(content: ContentNodeId[]) {
    const simRef = useRef(new Map<ContentNodeId, Similarities>());
    const [count, trigger] = useReducer((a) => ++a, 0);
    const broker = useBroker();
    const graph = useGraphService();

    useEffect(() => {
        content.forEach((c) => {
            const s = contentSimilarity(graph, c);
            let maxS = 0;
            let minS = 1000000;
            s.forEach((item) => {
                maxS = Math.max(maxS, item.weight);
                minS = Math.min(minS, item.weight);
            });
            simRef.current.set(c, { nodes: s, maxSimilarity: maxS, minSimilarity: minS });
        });
        trigger();
    }, [content, graph]);

    useEffect(() => {
        const handler = (id: NodeID) => {
            const s = contentSimilarity(graph, id as ContentNodeId);
            let maxS = 0;
            let minS = 1000000;
            s.forEach((item) => {
                maxS = Math.max(maxS, item.weight);
                minS = Math.min(minS, item.weight);
            });
            simRef.current.set(id as ContentNodeId, { nodes: s, maxSimilarity: maxS, minSimilarity: minS });
            trigger();
        };
        broker.on('edgetype-coengaged', handler);
        return () => {
            broker.off('edgetype-coengaged', handler);
        };
    }, [graph, broker]);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => ({ similar: simRef.current }), [count]);
}
