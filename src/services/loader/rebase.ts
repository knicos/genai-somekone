import { Edge } from '../graph/graphTypes';
import { LogItem } from './loaderTypes';

export function findLargestEdgeTimestamp(edges: Edge[]) {
    return edges.reduce((m, e) => Math.max(m, e.timestamp), 0);
}

export function findLargestLogTimestamp(log: LogItem[]) {
    return log.reduce(
        (m, l) =>
            Math.max(
                m,
                l.log.reduce((mm, ll) => Math.max(mm, ll.timestamp), 0)
            ),
        0
    );
}

export function rebaseEdges(edges: Edge[], offset: number) {
    edges.forEach((e) => {
        e.timestamp += offset;
    });
}

export function rebaseLog(log: LogItem[], offset: number) {
    log.forEach((user) => {
        user.log.forEach((l) => {
            l.timestamp += offset;
        });
    });
}
