import { useEffect, useMemo, useReducer } from 'react';
import { DestinationFor, EdgeType, NodeID, NodeType, SourceFor, WeightedNode } from './graphTypes';
import { getNodesByType } from './nodes';
import {
    addNodeEdgeTypeListener,
    addNodeListener,
    addNodeTypeListener,
    removeNodeEdgeTypeListener,
    removeNodeListener,
    removeNodeTypeListener,
} from './events';
import { getRelated } from './query';

export function useNode(id: NodeID) {
    const [, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addNodeListener(id, handler);
        return () => removeNodeListener(id, handler);
    }, [id]);
}

export function useNodeType<T extends NodeType>(type: T): NodeID<T>[] {
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addNodeTypeListener(type, handler);
        return () => removeNodeTypeListener(type, handler);
    }, [type]);
    return useMemo(() => getNodesByType(type), [type, count]);
}

export function useRelatedNodes<T extends EdgeType, S extends SourceFor<T>, D extends DestinationFor<T, S>>(
    id: S,
    type: T,
    size?: number
): WeightedNode<D>[] {
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addNodeEdgeTypeListener(id, type, handler);
        return () => removeNodeEdgeTypeListener(id, type, handler);
    }, [id, type]);
    return useMemo(() => getRelated(type, id, { count: size }), [id, type, size, count]);
}
