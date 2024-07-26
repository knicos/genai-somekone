import { getContentStats, getMaxContentEngagement } from '../content/content';
import { UserNodeId } from '../graph/graphTypes';
import { Recommendation, Scores, ScoringOptions } from './recommenderTypes';
import { UserNodeData } from '../users/userTypes';
import { calculateAffinities, calculateAffinityScores } from './scoring/affinity';
import { calculateEmbeddingScore } from './scoring/embeddings';
import { calculateCoengagementScore } from './scoring/coengaged';
import { getLastSeenTime } from './scoring/seen';

export function makeFeatures(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
): Scores[] {
    const preferences = calculateAffinities(profile);

    return candidates.map((c) => {
        const tasteSimilarityScore = options?.noTasteScore
            ? undefined
            : calculateEmbeddingScore('taste', profile, c.contentId);
        const {
            viewingPreferenceScore,
            commentingPreferenceScore,
            sharingPreferenceScore,
            reactionPreferenceScore,
            followingPreferenceScore,
        } = calculateAffinityScores(preferences, c.contentId, options);

        const coengagementScore = options?.noCoengagementScore
            ? undefined
            : calculateCoengagementScore(userId, c.contentId);

        const lastSeenTime = options?.noLastSeenScore ? undefined : getLastSeenTime(userId, c.contentId);

        const popScore = options?.noPopularity
            ? 0
            : (getContentStats(c.contentId)?.engagement || 0) / (getMaxContentEngagement() || 0.01);

        // userTasteSimilarity
        // userEngagementsSimilarity
        // coengagementScore
        // bestTopicAffinity
        // lastSeenTime (negative)
        // priorEngagements

        return {
            taste: tasteSimilarityScore,
            sharing: sharingPreferenceScore,
            commenting: commentingPreferenceScore,
            following: followingPreferenceScore,
            reaction: reactionPreferenceScore,
            viewing: viewingPreferenceScore,
            random: 0,
            coengagement: coengagementScore,
            lastSeen: lastSeenTime,
            popularity: popScore,
        };
    });
}

export function makeFeatureVectors(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
): number[][] {
    const features = makeFeatures(userId, candidates, profile, options);
    return features.map((i) => Object.values(i));
}
