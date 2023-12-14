import { ScoredRecommendation } from './recommenderTypes';
import { generateCandidates } from './candidates';
import { scoreCandidates } from './scoring';
import { UserNodeId } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { emitRecommendationEvent } from './events';
import { biasedUniqueSubset } from '@genaism/util/subsets';

const store = new Map<UserNodeId, ScoredRecommendation[]>();

export async function generateNewRecommendations(id: UserNodeId, count: number) {
    const profile = getUserProfile(id);
    const candidates = generateCandidates(profile, count);
    const scored = scoreCandidates(candidates, profile);

    const old = store.get(profile.id) || [];
    const subset = biasedUniqueSubset(scored, count, (v) => v.contentId);

    store.set(profile.id, [...subset, ...old]);
    emitRecommendationEvent(id, subset);
}

export function getRecommendations(id: UserNodeId, count: number): ScoredRecommendation[] {
    const results = store.get(id);
    return (results || []).slice(0, count);
}

export function appendRecommendations(id: UserNodeId, recommendations: ScoredRecommendation[]) {
    const old = store.get(id) || [];
    store.set(id, [...recommendations, ...old]);
    emitRecommendationEvent(id, recommendations);
}
