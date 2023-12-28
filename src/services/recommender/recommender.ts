import { RecommendationOptions, ScoredRecommendation } from './recommenderTypes';
import { generateCandidates } from './candidates';
import { scoreCandidates } from './scoring';
import { UserNodeId } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { emitRecommendationEvent } from './events';
import { biasedUniqueSubset } from '@genaism/util/subsets';

const store = new Map<UserNodeId, ScoredRecommendation[]>();

export async function generateNewRecommendations(id: UserNodeId, count: number, options: RecommendationOptions) {
    const profile = getUserProfile(id);
    const candidates = generateCandidates(profile, count, options);
    const scored = scoreCandidates(candidates, profile, options);

    const old = store.get(profile.id) || [];

    if (options?.selection === 'rank') {
        const subset = scored.slice(0, count);
        store.set(profile.id, [...subset, ...old]);
        emitRecommendationEvent(id, subset);
    } else {
        const subset = biasedUniqueSubset(scored, count, (v) => v.contentId);
        subset.sort((a, b) => b.score - a.score);

        store.set(profile.id, [...subset, ...old]);
        emitRecommendationEvent(id, subset);
    }
}

export function getRecommendations(id: UserNodeId, count: number): ScoredRecommendation[] {
    const results = store.get(id) || [];
    return results.slice(0, count);
}

export function appendRecommendations(id: UserNodeId, recommendations: ScoredRecommendation[]) {
    const old = store.get(id) || [];
    store.set(id, [...recommendations, ...old]);
    emitRecommendationEvent(id, recommendations);
}
