import { NodeType, Edge, GNode } from './graphTypes';

export const nodeStore = new Map<string, GNode>();
export const nodeTypeIndex = new Map<NodeType, GNode[]>();

export const edgeStore = new Map<string, Edge>();
export const edgeSrcIndex = new Map<string, Edge[]>();
export const edgeTypeSrcIndex = new Map<string, Edge[]>();

export function resetGraph() {
    nodeStore.clear();
    nodeTypeIndex.clear();
    edgeStore.clear();
    edgeSrcIndex.clear();
    edgeTypeSrcIndex.clear();
}
