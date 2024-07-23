import { NodeID, WeightedNode } from '@genaism/services/graph/graphTypes';

export function normWeights<T extends NodeID>(nodes: WeightedNode<T>[]) {
    let min = Number.MAX_SAFE_INTEGER;
    let max = Number.MIN_SAFE_INTEGER;
    for (let i = 0; i < nodes.length; ++i) {
        min = Math.min(min, nodes[i].weight);
        max = Math.max(max, nodes[i].weight);
    }

    const diff = max - min;
    return nodes.map((n) => ({ id: n.id, weight: diff > 0 ? (n.weight - min) / diff : 1 }));
}
