import { getEdgesOfType } from './edges';
import { DestinationFor, Edge, EdgeType, NodeID, SourceFor, WeightedNode } from './graphTypes';

interface QueryOptions<A extends NodeID, B extends NodeID> {
    count?: number;
    period?: number;
    strictPeriod?: number;
    startTimeOffset?: number;
    timeDecay?: number;
    weightFn?: (edge: Edge<A, B>) => number;
}

export function getRelated<T extends EdgeType, N extends SourceFor<T>, R extends DestinationFor<T, N>>(
    type: T,
    node: N | N[],
    options?: QueryOptions<N, R>
): WeightedNode<R>[] {
    const period = options?.period;
    const strictPeriod = options?.strictPeriod;
    const startTime = options?.startTimeOffset || 0;
    const count = options?.count;
    const timeDecay = options?.timeDecay;

    const edges = getEdgesOfType<T, N, Edge<N, R>>(type, node);

    const now = Date.now();
    const firstTime =
        strictPeriod !== undefined
            ? now - (startTime || 0)
            : edges.reduce((f, e) => Math.max(f, e.timestamp), 0) - (startTime || 0);
    const aPeriod =
        strictPeriod !== undefined ? firstTime - strictPeriod : period === undefined ? 0 : firstTime - period;

    const filtered =
        period === undefined && strictPeriod === undefined
            ? edges
            : edges.filter((e) => e.timestamp <= firstTime && e.timestamp >= aPeriod);
    const weighted = filtered.map((e) => ({
        id: e.destination,
        weight: options?.weightFn
            ? options.weightFn(e)
            : timeDecay === undefined
            ? e.weight
            : e.weight * (1.0 - (1.0 - timeDecay) * (1 - (e.timestamp - aPeriod) / (firstTime - aPeriod))),
    }));
    weighted.sort((a, b) => b.weight - a.weight);
    return count ? weighted.slice(0, count) : weighted;
}
