import { UserProfile } from '../profiler/profilerTypes';
import { makeFeatureVectors } from './features';
import { Recommendation, ScoredRecommendation, ScoringOptions } from './recommenderTypes';

function calculateSignificance(items: ScoredRecommendation[]) {
    if (items.length < 1) return;
    const means = new Array(items[0].scores.length);
    means.fill(0);

    items.forEach((item) => {
        item.scores.forEach((score, ix) => {
            means[ix] += score;
        });
    });
    means.forEach((mean, ix) => {
        means[ix] = mean / items.length;
    });

    const deviations = new Array(items[0].scores.length);
    deviations.fill(0);
    items.forEach((item) => {
        item.scores.forEach((score, ix) => {
            const diff = score - means[ix];
            deviations[ix] += diff * diff;
        });
    });
    deviations.forEach((dev, ix) => {
        deviations[ix] = Math.sqrt(dev / items.length);
    });

    items.forEach((item) => {
        item.significance = item.scores.map((score, ix) => {
            const dev = deviations[ix];
            return dev > 0 ? (score - means[ix]) / deviations[ix] : 0;
        });
    });
}

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
        rankScore: 0,
    }));

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, ix) => {
        r.rank = ix + 1;
        r.rankScore = 1 - ix / results.length;
    });

    if (!options?.excludeSignificance) {
        calculateSignificance(results);
    }

    // console.log('SCORED', results);
    return results;
}
