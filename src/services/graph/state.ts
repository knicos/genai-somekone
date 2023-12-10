import { NodeType, Edge, GNode, NodeID } from './graphTypes';

export const nodeStore = new Map<string, GNode<NodeType>>();
export const nodeTypeIndex = new Map<NodeType, GNode<NodeType>[]>();

export const edgeStore = new Map<string, Edge<NodeID<NodeType>, NodeID<NodeType>>>();
export const edgeSrcIndex = new Map<string, Edge<NodeID<NodeType>, NodeID<NodeType>>[]>();
export const edgeTypeSrcIndex = new Map<string, Edge<NodeID<NodeType>, NodeID<NodeType>>[]>();

export function resetGraph() {
    nodeStore.clear();
    nodeTypeIndex.clear();
    edgeStore.clear();
    edgeSrcIndex.clear();
    edgeTypeSrcIndex.clear();
}

export function dump() {
    return {
        nodes: Array.from(nodeStore.values()),
        edges: Array.from(edgeStore.values()),
    };
}

export function dumpJSON() {
    return JSON.stringify(dump(), undefined, 4);
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const _global = (window /* browser */ || global) /* node */ as any;
_global.dumpGraph = dumpJSON;
