import { getNodesByType } from '@genaism/services/graph/nodes';
import { uniformUniqueSubset } from '@genaism/util/subsets';
import { Recommendation } from '../recommenderTypes';

export function fillWithRandom(nodes: Recommendation[], count: number) {
    const allNodes = getNodesByType('content');
    if (allNodes.length === 0) return;

    const now = Date.now();
    const randomNodes = uniformUniqueSubset(allNodes, count, (v) => v);
    randomNodes.forEach((node) => {
        nodes.push({
            contentId: node,
            candidateOrigin: 'random',
            timestamp: now,
        });
    });
}

export function randomCandidateProbability(count: number) {
    const allNodes = getNodesByType('content');
    return 1 - Math.pow(1 - 1 / allNodes.length, count);
}
