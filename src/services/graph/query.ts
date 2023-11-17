import { getEdgesOfType } from './edges';
import { EdgeType, WeightedNode } from './graphTypes';

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
