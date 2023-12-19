import { UserProfile } from '../profiler/profilerTypes';
import { makeFeatureVectors } from './features';
import { Recommendation, ScoredRecommendation, ScoringOptions } from './recommenderTypes';

export function scoreCandidates(
    candidates: Recommendation[],
    profile: UserProfile,
    options?: ScoringOptions
): ScoredRecommendation[] {
    // Could use Tensorflow here?
    const featureVectors = makeFeatureVectors(candidates, profile, options);
    const scores = featureVectors.map((c) => c.map((f, ix) => f * (profile.featureWeights[ix] || 0)));
    const results: ScoredRecommendation[] = candidates.map((c, ix) => ({
        ...c,
        features: featureVectors[ix],
        scores: scores[ix],
        score: scores[ix].reduce((s, v) => s + v, 0),
        rank: 0,
    }));

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, ix) => {
        r.rank = ix + 1;
    });
    return results;
}
