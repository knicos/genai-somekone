import { emitNodeEdgeTypeEvent } from './events';
import { EdgeType, Edge } from './graphTypes';
import { edgeSrcIndex, edgeStore, edgeTypeSrcIndex, nodeStore } from './state';

export function addEdge(type: EdgeType, src: string, dest: string, weight?: number): string | null {
    if (!nodeStore.has(src) || !nodeStore.has(dest)) return null;

    const id = `${dest}:${type}:${src}`;
    const edge = { type, source: src, destination: dest, weight: weight || 0, metadata: {} };
    const had = edgeStore.has(id);
    edgeStore.set(id, edge);

    if (had) {
        emitNodeEdgeTypeEvent(src, type);
        return id;
    }

    if (!edgeSrcIndex.has(src)) edgeSrcIndex.set(src, []);
    edgeSrcIndex.get(src)?.push(edge);

    const typesrckey = `${type}:${src}`;
    if (!edgeTypeSrcIndex.has(typesrckey)) edgeTypeSrcIndex.set(typesrckey, []);
    edgeTypeSrcIndex.get(typesrckey)?.push(edge);

    emitNodeEdgeTypeEvent(src, type);

    return id;
}
export function addBiEdge(type: EdgeType, src: string, dest: string, weight?: number) {
    addEdge(type, src, dest, weight);
    addEdge(type, dest, src, weight);
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

    emitNodeEdgeTypeEvent(src, type);
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
                resultSet.push(...candidates);
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
                        resultSet.push(...candidates);
                    }
                    if (count && resultSet.length > count) break;
                }
            } else {
                const candidates = edgeTypeSrcIndex.get(`${type}:${n}`);
                if (candidates) {
                    resultSet.push(...candidates);
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
                    resultSet.push(...candidates);
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
