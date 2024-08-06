import { SMConfig } from '@genaism/state/smConfig';
import { batchMap } from '@genaism/util/batch';
import {
    ContentNodeId,
    GraphService,
    Recommendation,
    RecommenderService,
    uniformUniqueSubset,
    UserNodeData,
    UserNodeId,
    WeightedNode,
} from '@knicos/genai-recom';

const CANDIDATE_FACTOR = 10;

export function heatmapImageSet(graph: GraphService, dim: number): ContentNodeId[] {
    const contents = graph.getNodesByType('content');
    return uniformUniqueSubset(contents, dim * dim, (v) => v);
}

export async function heatmapScores(
    recommender: RecommenderService,
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
            candidateProbability: recommender.getCandidateProbability(
                profile,
                9 * CANDIDATE_FACTOR,
                config.recommendations,
                p
            ),
        }));

        console.log('Candidate time', performance.now() - start);

        const scores = recommender.getScoringProbabilities(user, candidates, profile, 9, config.recommendations);
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
