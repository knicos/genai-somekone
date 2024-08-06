import { DestinationFor, EdgeType, NodeID, NodeType, SourceFor, WeightedNode } from '@knicos/genai-recom';
import { useEffect, useMemo, useReducer } from 'react';
import { useBroker, useGraphService } from './services';

export function useNode(id: NodeID) {
    const broker = useBroker();
    const [, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`node-${id}`, handler);
        return () => broker.off(`node-${id}`, handler);
    }, [id, broker]);
}

export function useNodeType<T extends NodeType>(type: T): NodeID<T>[] {
    const broker = useBroker();
    const graph = useGraphService();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`nodetype-${type}`, handler);
        return () => broker.off(`nodetype-${type}`, handler);
    }, [type, broker]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => graph.getNodesByType(type), [type, count, graph]);
}

export function useRelatedNodes<T extends EdgeType, S extends SourceFor<T>, D extends DestinationFor<T, S>>(
    id: S,
    type: T,
    size?: number
): WeightedNode<D>[] {
    const broker = useBroker();
    const graph = useGraphService();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`nodeedgetype-${id}-${type}`, handler);
        return () => broker.off(`nodeedgetype-${id}-${type}`, handler);
    }, [id, type, broker]);
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return useMemo(() => graph.getRelated(type, id, { count: size }), [id, type, size, count, graph]);
}
