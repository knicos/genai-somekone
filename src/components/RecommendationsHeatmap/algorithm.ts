import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { candidateProbabilities } from '@genaism/services/recommender/candidates';
import { Recommendation } from '@genaism/services/recommender/recommenderTypes';
import { scoringProbability } from '@genaism/services/recommender/scoring';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { SMConfig } from '@genaism/state/smConfig';
import { batchMap } from '@genaism/util/batch';
import { uniformUniqueSubset } from '@genaism/util/subsets';

const CANDIDATE_FACTOR = 10;

export function heatmapImageSet(dim: number): ContentNodeId[] {
    const contents = getNodesByType('content');
    return uniformUniqueSubset(contents, dim * dim, (v) => v);
}

export async function heatmapScores(
    images: ContentNodeId[],
    user: UserNodeId,
    profile: UserNodeData,
    config: SMConfig
): Promise<WeightedNode<ContentNodeId>[]> {
    const start = performance.now();
    if (profile) {
        const candidates: Recommendation[] = await batchMap(images, 100, (p) => ({
            candidateOrigin: 'popular',
            contentId: p,
            timestamp: Date.now(),
            candidateProbability: candidateProbabilities(profile, 9 * CANDIDATE_FACTOR, config.recommendations, p),
        }));

        console.log('Candidate time', performance.now() - start);

        const scores = scoringProbability(user, candidates, profile, 9, config.recommendations);
        scores.sort((a, b) => (b.probability || 0) - (a.probability || 0));

        const end = performance.now();
        console.log('Score time', end - start);
        return scores.map((s) => ({
            id: s.contentId,
            weight: s.probability || 0,
        }));
    }
    return images.map((i) => ({ id: i, weight: 0 }));
}
