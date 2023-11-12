import { EdgeType, NodeType, Edge, WeightedNode, GNode } from './graphTypes';
import { v4 as uuidv4 } from 'uuid';

const nodeStore = new Map<string, GNode>();
const nodeTypeIndex = new Map<NodeType, GNode[]>();

const edgeStore = new Map<string, Edge>();
const edgeSrcIndex = new Map<string, Edge[]>();
const edgeTypeSrcIndex = new Map<string, Edge[]>();

export function resetGraph() {
    nodeStore.clear();
    nodeTypeIndex.clear();
    edgeStore.clear();
    edgeSrcIndex.clear();
    edgeTypeSrcIndex.clear();
}

export function removeNode(id: string) {
    // Remove all edges first.
    const edges = edgeSrcIndex.get(id);
    if (edges) {
        edges.forEach((edge) => {
            const id = `${edge.destination}:${edge.type}:${edge.source}`;
            const srctypeid = `${edge.type}:${edge.source}`;
            edgeStore.delete(id);
            edgeSrcIndex.delete(edge.source);
            edgeTypeSrcIndex.delete(srctypeid);
        });
    }

    const node = nodeStore.get(id);
    if (node) {
        const typeIndex = nodeTypeIndex.get(node.type);
        nodeTypeIndex.set(
            node.type,
            (typeIndex || []).filter((f) => f.id !== id)
        );
        nodeStore.delete(id);
    }
}

export function addNode(type: NodeType, id?: string): string {
    const nid = id ? id : uuidv4();
    if (nodeStore.has(nid)) throw new Error('id_exists');
    const node = { type, id: nid };
    nodeStore.set(nid, node);
    if (!nodeTypeIndex.has(type)) {
        nodeTypeIndex.set(type, []);
    }
    const typeArray = nodeTypeIndex.get(type);
    if (typeArray) typeArray.push(node);
    return nid;
}

export function getNodeType(id: string): NodeType | null {
    const n = nodeStore.get(id);
    return n ? n.type : null;
}

export function getNodesByType(type: NodeType): string[] {
    const nt = nodeTypeIndex.get(type);
    return nt ? nt.map((n) => n.id) : [];
}

export function addEdge(type: EdgeType, src: string, dest: string, weight?: number) {
    const id = `${dest}:${type}:${src}`;
    const edge = { type, source: src, destination: dest, weight: weight || 0, metadata: {} };
    edgeStore.set(id, edge);

    if (!edgeSrcIndex.has(src)) edgeSrcIndex.set(src, []);
    edgeSrcIndex.get(src)?.push(edge);

    const typesrckey = `${type}:${src}`;
    if (!edgeTypeSrcIndex.has(typesrckey)) edgeTypeSrcIndex.set(typesrckey, []);
    edgeTypeSrcIndex.get(typesrckey)?.push(edge);
}

export function addOrAccumulateEdge(type: EdgeType, src: string, dest: string, weight: number) {
    const id = `${dest}:${type}:${src}`;
    const oldEdge = edgeStore.get(id);
    const edge = oldEdge || { type, source: src, destination: dest, weight: 0, metadata: {} };
    edge.weight += weight;

    if (!oldEdge) {
        edgeStore.set(id, edge);
        if (!edgeSrcIndex.has(src)) edgeSrcIndex.set(src, []);
        edgeSrcIndex.get(src)?.push(edge);

        const typesrckey = `${type}:${src}`;
        if (!edgeTypeSrcIndex.has(typesrckey)) edgeTypeSrcIndex.set(typesrckey, []);
        edgeTypeSrcIndex.get(typesrckey)?.push(edge);
    }
}

export function getEdgeWeights(type: EdgeType, src: string, dest?: string | string[]): number[] {
    if (!dest) {
        return getEdgesOfType(type, src).map((e) => e.weight);
    } else if (Array.isArray(dest)) {
        return dest.map((d) => {
            const id = `${d}:${type}:${src}`;
            const edge = edgeStore.get(id);
            return edge ? edge.weight : 0;
        });
    } else {
        const id = `${dest}:${type}:${src}`;
        const edge = edgeStore.get(id);
        return [edge ? edge.weight : 0];
    }
}

export function getEdges(node: string | string[], count?: number): Edge[] {
    if (Array.isArray(node)) {
        const resultSet: Edge[] = [];
        for (let i = 0; i < node.length; ++i) {
            const n = node[i];
            const candidates = edgeSrcIndex.get(n);
            if (candidates) {
                resultSet.push.apply(resultSet, candidates);
            }
            if (count && resultSet.length > count) break;
        }
        return count ? resultSet.slice(0, count) : resultSet;
    } else {
        const results = edgeSrcIndex.get(node) || [];
        return count ? results.slice(0, count) : results;
    }
}

export function getEdgesOfType(type: EdgeType | EdgeType[], node: string | string[], count?: number): Edge[] {
    if (Array.isArray(node)) {
        const resultSet: Edge[] = [];
        for (let i = 0; i < node.length; ++i) {
            const n = node[i];

            if (Array.isArray(type)) {
                for (let j = 0; j < type.length; ++j) {
                    const t = type[j];
                    const candidates = edgeTypeSrcIndex.get(`${t}:${n}`);
                    if (candidates) {
                        resultSet.push.apply(resultSet, candidates);
                    }
                    if (count && resultSet.length > count) break;
                }
            } else {
                const candidates = edgeTypeSrcIndex.get(`${type}:${n}`);
                if (candidates) {
                    resultSet.push.apply(resultSet, candidates);
                }
            }
            if (count && resultSet.length > count) break;
        }
        return count ? resultSet.slice(0, count) : resultSet;
    } else {
        if (Array.isArray(type)) {
            const resultSet: Edge[] = [];
            for (let i = 0; i < type.length; ++i) {
                const t = type[i];
                const candidates = edgeTypeSrcIndex.get(`${t}:${node}`);
                if (candidates) {
                    resultSet.push.apply(resultSet, candidates);
                }
                if (count && resultSet.length > count) break;
            }
            return count ? resultSet.slice(0, count) : resultSet;
        } else {
            const results = edgeTypeSrcIndex.get(`${type}:${node}`) || [];
            return count ? results.slice(0, count) : results;
        }
    }
}

export type NodeFactors = Map<string, number>;

export function getRelated(
    type: EdgeType | EdgeType[],
    node: string | string[],
    count?: number,
    factors?: NodeFactors
): WeightedNode[] {
    const edges = getEdgesOfType(type, node);
    if (factors) {
        edges.sort((a, b) => {
            const fb = factors.get(b.destination) || 1;
            const fa = factors.get(a.destination) || 1;
            return fb * b.weight - fa * a.weight;
        });
    } else {
        edges.sort((a, b) => b.weight - a.weight);
    }
    const results = edges.map((e) => ({ id: e.destination, weight: (factors?.get(e.destination) || 1) * e.weight }));
    return count ? results.slice(0, count) : results;
}
