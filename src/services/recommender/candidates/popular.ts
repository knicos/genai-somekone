import { getNodesByType } from '@genaism/services/graph/nodes';
import { biasedUniqueSubset } from '@genaism/util/subsets';
import { Recommendation } from '../recommenderTypes';
import { ContentNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getContentStats, getMaxContentEngagement } from '@genaism/services/content/content';

export function getPopularCandidates(nodes: Recommendation[], count: number) {
    const allNodes = getNodesByType('content');
    if (allNodes.length === 0) return;

    const maxEngagement = getMaxContentEngagement() || 1;
    const popular: WeightedNode<ContentNodeId>[] = allNodes.map((n) => ({
        id: n,
        weight: getContentStats(n).engagement / maxEngagement,
    }));
    popular.sort((a, b) => b.weight - a.weight);

    const now = Date.now();
    const randomNodes = biasedUniqueSubset(popular, count, (v) => v.weight);
    randomNodes.forEach((node) => {
        nodes.push({
            contentId: node.id,
            candidateOrigin: 'popular',
            popularityScore: node.weight,
            timestamp: now,
        });
    });
}
