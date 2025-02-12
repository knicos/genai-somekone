import { NodeID, WeightedNode } from '@knicos/genai-recom';

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

export function zNormWeights<T extends NodeID>(nodes: WeightedNode<T>[], factor = 1) {
    const mean = nodes.reduce((m, v) => m + v.weight, 0) / nodes.length;
    const variance = nodes.reduce((va, v) => va + (v.weight - mean) * (v.weight - mean), 0) / nodes.length;
    const sd = Math.sqrt(variance);

    const result = nodes.map((n) => ({ id: n.id, weight: Math.min(1, n.weight / (mean + factor * sd)) }));
    return result;
}
