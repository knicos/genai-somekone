import { emitNodeEdgeTypeEvent } from './events';
import { DestinationFor, Edge, EdgeType, NodeID, NodeType, SourceFor } from './graphTypes';
import { edgeSrcIndex, edgeStore, edgeTypeSrcIndex, nodeStore } from './state';

export function addEdge<T extends EdgeType, S extends SourceFor<T>, D extends DestinationFor<T, S>>(
    type: T,
    src: S,
    dest: D,
    weight?: number,
    timestamp?: number
): string | null {
    if (!nodeStore.has(src) || !nodeStore.has(dest)) return null;

    const id = `${dest}:${type}:${src}`;
    const oldEdge = edgeStore.get(id);

    if (oldEdge) {
        oldEdge.weight = weight || 0;
        oldEdge.timestamp = timestamp || Date.now();
        emitNodeEdgeTypeEvent(src, type);
        return id;
    }

    const edge = { type, source: src, destination: dest, weight: weight || 0, metadata: {}, timestamp: 0 };
    edge.timestamp = timestamp || Date.now();
    edgeStore.set(id, edge);

    if (!edgeSrcIndex.has(src)) edgeSrcIndex.set(src, []);
    edgeSrcIndex.get(src)?.push(edge);

    const typesrckey = `${type}:${src}`;
    if (!edgeTypeSrcIndex.has(typesrckey)) edgeTypeSrcIndex.set(typesrckey, []);
    edgeTypeSrcIndex.get(typesrckey)?.push(edge);

    emitNodeEdgeTypeEvent(src, type);

    return id;
}

export function addEdges(edges: Edge<NodeID>[]) {
    edges.forEach((edge) => {
        const id = `${edge.destination}:${edge.type}:${edge.source}`;
        edgeStore.set(id, edge);
        const oldSrcIndex = edgeSrcIndex.get(edge.source);
        if (oldSrcIndex) {
            oldSrcIndex.push(edge);
        } else {
            edgeSrcIndex.set(edge.source, [edge]);
        }

        const typesrckey = `${edge.type}:${edge.source}`;
        const oldTypeIndex = edgeTypeSrcIndex.get(typesrckey);
        if (oldTypeIndex) {
            oldTypeIndex.push(edge);
        } else {
            edgeTypeSrcIndex.set(typesrckey, [edge]);
        }

        emitNodeEdgeTypeEvent(edge.source, edge.type);
    });
}

export function addOrAccumulateEdge<T extends EdgeType, S extends SourceFor<T>, D extends DestinationFor<T, S>>(
    type: T,
    src: S,
    dest: D,
    weight: number
) {
    const id = `${dest}:${type}:${src}`;
    const oldEdge = edgeStore.get(id);
    const edge = oldEdge || { type, source: src, destination: dest, weight: 0, metadata: {}, timestamp: 0 };
    edge.timestamp = Date.now();
    edge.weight += weight;

    if (!oldEdge) {
        edgeStore.set(id, edge);
        if (!edgeSrcIndex.has(src)) edgeSrcIndex.set(src, []);
        edgeSrcIndex.get(src)?.push(edge);

        const typesrckey = `${type}:${src}`;
        if (!edgeTypeSrcIndex.has(typesrckey)) edgeTypeSrcIndex.set(typesrckey, []);
        edgeTypeSrcIndex.get(typesrckey)?.push(edge);
    }

    emitNodeEdgeTypeEvent(src, type);
}

export function getEdgeWeights<T extends EdgeType, S extends SourceFor<T>, D extends DestinationFor<T, S>>(
    type: T,
    src: S,
    dest?: D | D[]
): number[] {
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

export function getEdges<T extends NodeID<NodeType>>(node: T | T[], count?: number): Edge<T, NodeID<NodeType>>[] {
    if (Array.isArray(node)) {
        const resultSet: Edge<T, NodeID<NodeType>>[] = [];
        for (let i = 0; i < node.length; ++i) {
            const n = node[i];
            const candidates = edgeSrcIndex.get(n);
            if (candidates) {
                resultSet.push(...(candidates as Edge<T, NodeID<NodeType>>[]));
            }
            if (count && resultSet.length > count) break;
        }
        return count ? resultSet.slice(0, count) : resultSet;
    } else {
        const results = (edgeSrcIndex.get(node) || []) as Edge<T, NodeID<NodeType>>[];
        return count ? results.slice(0, count) : results;
    }
}

export function getEdgesOfType<T extends EdgeType, N extends SourceFor<T>, R = Edge<N, DestinationFor<T, N>>>(
    type: T,
    node: N | N[],
    count?: number
): R[] {
    if (Array.isArray(node)) {
        const resultSet: R[] = [];
        for (let i = 0; i < node.length; ++i) {
            const n = node[i];

            if (Array.isArray(type)) {
                for (let j = 0; j < type.length; ++j) {
                    const t = type[j];
                    const candidates = edgeTypeSrcIndex.get(`${t}:${n}`);
                    if (candidates) {
                        resultSet.push(...(candidates as R[]));
                    }
                    if (count && resultSet.length > count) break;
                }
            } else {
                const candidates = edgeTypeSrcIndex.get(`${type}:${n}`);
                if (candidates) {
                    resultSet.push(...(candidates as R[]));
                }
            }
            if (count && resultSet.length > count) break;
        }
        return count ? resultSet.slice(0, count) : resultSet;
    } else {
        if (Array.isArray(type)) {
            const resultSet: R[] = [];
            for (let i = 0; i < type.length; ++i) {
                const t = type[i];
                const candidates = edgeTypeSrcIndex.get(`${t}:${node}`);
                if (candidates) {
                    resultSet.push(...(candidates as R[]));
                }
                if (count && resultSet.length > count) break;
            }
            return count ? resultSet.slice(0, count) : resultSet;
        } else {
            const results = (edgeTypeSrcIndex.get(`${type}:${node}`) || []) as R[];
            return count ? results.slice(0, count) : results;
        }
    }
}
