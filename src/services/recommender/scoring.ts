import { normalise } from '@genaism/util/embedding';
import { makeFeatures } from './features';
import { Recommendation, ScoredRecommendation, Scores, ScoringOptions } from './recommenderTypes';
import { UserNodeId } from '../graph/graphTypes';
import { UserNodeData } from '../users/userTypes';
import { beta } from 'jstat';

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
        //const p = options?.selection === 'distribution' ? betaProbability(ix, results.length) : 1 - ix / results.length;
        //const pc = 1 - Math.pow(1 - p, 10);
        r.rank = ix;
        //r.probability = r.probability === undefined ? 1 : r.probability * p;
    });

    if (!options?.excludeSignificance) {
        calculateSignificance(results);
    }

    // console.log('SCORED', results);
    return results;
}

const ALPHA = 0.5;
const BETA = 1;

export function scoringProbability(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    count: number,
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
    const totalScores = results.reduce((s, v) => s + v.score, 0);

    if (totalScores === 0) {
        results.forEach((r, ix) => {
            r.rank = ix / results.length;
            r.probability = (r.candidateProbability || 0) * (1 / results.length);
        });
        return results;
    }

    // Claude.ai solution
    if (options?.selection === 'distribution') {
        results.forEach((r, ix) => {
            r.rank = (ix - 0.5) / results.length;
            const p = 1 - beta.cdf(r.rank, ALPHA, BETA);
            r.probability = (r.candidateProbability || 0) * p;
        });

        // Normalise the probabilities
        const sumP = results.reduce((s, r) => s + (r.probability || 0), 0);
        results.forEach((r) => {
            r.probability = (r.probability || 0) / sumP;
        });
    } else {
        const accumProb = results.map((a) => 1 - (a.candidateProbability || 0) * (1 / count));
        for (let i = 1; i < accumProb.length; ++i) {
            const p = accumProb[i];
            const p1 = accumProb[i - 1];
            accumProb[i] = p1 * p;
        }

        results.forEach((r, i) => {
            const sp1 = i >= 1 ? accumProb[i - 1] : 1;
            const p = (r.candidateProbability || 0) * sp1;
            r.probability = 1 - Math.pow(1 - p, count);
            r.rank = i / results.length;
        });
    }

    return results;
}
