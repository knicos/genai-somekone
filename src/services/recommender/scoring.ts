import { normalise } from '@genaism/util/embedding';
import { makeFeatures } from './features';
import { Recommendation, ScoredRecommendation, Scores, ScoringOptions } from './recommenderTypes';
import { UserNodeId } from '../graph/graphTypes';
import { UserNodeData } from '../users/userTypes';

function calculateSignificance(items: ScoredRecommendation[]) {
    if (items.length < 1) return;

    const keys = Object.keys(items[0].scores) as (keyof Scores)[];
    const means = new Array(keys.length);
    means.fill(0);

    items.forEach((item) => {
        keys.forEach((k, ix) => {
            means[ix] += item.scores[k];
        });
    });
    means.forEach((mean, ix) => {
        means[ix] = mean / items.length;
    });

    const deviations = new Array(means.length);
    deviations.fill(0);
    items.forEach((item) => {
        keys.forEach((k, ix) => {
            const diff = (item.scores[k] || 0) - means[ix];
            deviations[ix] += diff * diff;
        });
    });
    deviations.forEach((dev, ix) => {
        deviations[ix] = Math.sqrt(dev / items.length);
    });

    items.forEach((item) => {
        item.significance = keys.reduce((r, k, ix) => {
            const dev = deviations[ix];
            return { ...r, [k]: dev > 0 ? ((item.scores[k] || 0) - means[ix]) / deviations[ix] : 0 };
        }, {});
    });
}

export function scoreCandidates(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
): ScoredRecommendation[] {
    // Could use Tensorflow here?
    const features = makeFeatures(userId, candidates, profile, options);
    const keys = (features.length > 0 ? Object.keys(features[0]) : []) as (keyof Scores)[];
    const featureVectors = features.map((i) => Object.values(i));
    const weights = normalise(keys.map((k) => profile.featureWeights[k] || 1));
    const scores = featureVectors.map((c) => c.map((f, ix) => f * (weights[ix] || 0)));
    const namedScores = scores.map((s) => s.reduce((r, v, ix) => ({ ...r, [keys[ix]]: v }), {}));
    const results: ScoredRecommendation[] = candidates.map((c, ix) => ({
        ...c,
        features: features[ix],
        scores: namedScores[ix],
        significance: {},
        score: scores[ix].reduce((s, v) => s + v, 0),
        rank: 0,
        diversity: 0,
    }));

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, ix) => {
        r.rank = ix;
    });

    if (!options?.excludeSignificance) {
        calculateSignificance(results);
    }

    // console.log('SCORED', results);
    return results;
}
