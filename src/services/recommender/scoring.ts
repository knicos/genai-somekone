import { ContentNodeId, Edge, UserNodeId } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { UserProfile } from '../profiler/profilerTypes';
import { makeFeatureVectors } from './features';
import { Recommendation, ScoredRecommendation } from './recommenderTypes';

const MIN5 = 5 * 60 * 1000;

export function scoreCandidates(candidates: Recommendation[], profile: UserProfile): ScoredRecommendation[] {
    const now = Date.now();
    const seenImages = getRelated('seen', profile.id, {
        period: MIN5,
        weightFn: (edge: Edge<UserNodeId, ContentNodeId>) => (now - edge.timestamp) / MIN5,
    });
    const seenMap = new Map<ContentNodeId, number>();
    seenImages.forEach((s) => {
        seenMap.set(s.id, s.weight);
    });

    // Could use Tensorflow here?
    const featureVectors = makeFeatureVectors(candidates, profile);
    const scores = featureVectors.map((c) => c.map((f, ix) => f * (profile.featureWeights[ix] || 0)));
    const results: ScoredRecommendation[] = candidates.map((c, ix) => ({
        ...c,
        features: featureVectors[ix],
        scores: scores[ix],
        score: scores[ix].reduce((s, v) => s + v, 0),
        rank: 0,
        seenFactor: seenMap.has(c.contentId) ? seenMap.get(c.contentId) || 0 : 1,
    }));

    results.sort((a, b) => b.score - a.score);
    return results;
}
