import { makeFeatures } from './features';
import { Recommendation, ScoredRecommendation, Scores, ScoringOptions } from './recommenderTypes';
import { UserNodeId } from '../graph/graphTypes';
import { UserNodeData } from '../users/userTypes';
import { beta } from 'jstat';

function normalise(v: number[]) {
    const sum = v.reduce((s, i) => s + i, 0);
    return sum > 0 ? v.map((i) => i / sum) : v.slice();
}

function calculateSignificance(items: ScoredRecommendation[]) {
    if (items.length === 0) return [];
    const keys = Object.keys(items[0].scores) as (keyof Scores)[];

    items.forEach((item, i) => {
        const significance: Scores = {};
        let maxSig = -Infinity;

        keys.forEach((key) => {
            for (let k = i + 1; k < items.length; ++k) {
                const diff = (item.scores[key] || 0) - (items[k].scores[key] || 0);
                const s = (significance[key] || 0) + diff;
                significance[key] = s;
                maxSig = Math.max(maxSig, s);
            }
        });

        keys.forEach((key) => {
            const s = significance[key] || 0;
            significance[key] = maxSig > 0 ? Math.max(0, s) / maxSig : 0;
        });

        item.significance = significance;
    });
}

function calculateScores(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
) {
    // Could use Tensorflow here?
    const features = makeFeatures(userId, candidates, profile, options);
    const keys = (features.length > 0 ? Object.keys(features[0]) : []) as (keyof Scores)[];
    const featureVectors = features.map((i) => Object.values(i));
    const weights = normalise(keys.map((k) => profile.featureWeights[k] || 1));
    const scores = featureVectors.map((c) => c.map((f, ix) => (f || 0) * (weights[ix] || 0)));
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

    return results;
}

export function scoreCandidates(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
): ScoredRecommendation[] {
    const results = calculateScores(userId, candidates, profile, options);

    results.sort((a, b) => b.score - a.score);
    results.forEach((r, ix) => {
        r.rank = ix;
    });

    if (!options?.excludeSignificance) {
        calculateSignificance(results);
    }

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
    const results = calculateScores(userId, candidates, profile, options);

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
