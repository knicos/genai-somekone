import { useEffect, useMemo, useReducer } from 'react';
import { EdgeType, NodeType, WeightedNode } from './graphTypes';
import { getNodesByType } from './nodes';
import {
    addEdgeTypeListener,
    addNodeListener,
    addNodeTypeListener,
    removeEdgeTypeListener,
    removeNodeListener,
    removeNodeTypeListener,
} from './events';
import { getRelated } from './query';

export function useNode(id: string) {
    const [, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addNodeListener(id, handler);
        return () => removeNodeListener(id, handler);
    }, [id]);
}

export function useNodeType(type: NodeType): string[] {
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addNodeTypeListener(type, handler);
        return () => removeNodeTypeListener(type, handler);
    }, [type]);
    return useMemo(() => getNodesByType(type), [type, count]);
}

export function useRelatedNodes(id: string, type: EdgeType, size?: number): WeightedNode[] {
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addEdgeTypeListener(id, type, handler);
        return () => removeEdgeTypeListener(id, type, handler);
    }, [id, type]);
    return useMemo(() => getRelated(type, id, size), [id, type, size, count]);
}
