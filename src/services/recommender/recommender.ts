import { getUserProfile } from '@genaism/services/profiler/profiler';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { ScoredRecommendation } from './recommenderTypes';
import { generateCandidates } from './candidates';
import { scoreCandidates } from './scoring';

export function generateFeed(count: number): [ScoredRecommendation[], ProfileSummary] {
    // For each candidate strategy, generate a number of condidates based upon affinity
    // Repeat until there are enough candidates
    // Randomly select from the candidates

    const profile = getUserProfile();

    const candidates = generateCandidates(profile, count);
    const scored = scoreCandidates(candidates, profile, count);

    if (candidates.length < count) {
        return [scored, profile];
    }

    // TODO: Score the results by how much they match profile
    // Or by how they match past engagements of each type.
    // but each image would need a lot of labels for this to work directly

    return [scored, profile];
}
