import { getTopicId } from '../concept/concept';
import { getEdge, getEdgeWeights } from '../graph/edges';
import { ContentNodeId, TopicNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { UserProfile } from '../profiler/profilerTypes';
import { calculateSimilarity } from '../users/users';
import { Recommendation, ScoringOptions } from './recommenderTypes';

const COENGAGEMENT_MAX = 4;

interface Preferences {
    viewing: WeightedNode<TopicNodeId>[];
    commenting: WeightedNode<TopicNodeId>[];
    sharing: WeightedNode<TopicNodeId>[];
    following: WeightedNode<TopicNodeId>[];
    reacting: WeightedNode<TopicNodeId>[];
}

function calculatePreferences(profile: UserProfile): Preferences {
    const seenTopicMap = new Map<string, number>();
    profile.seenTopics.forEach((s) => {
        seenTopicMap.set(s.label, s.weight);
    });

    return {
        viewing: profile.viewedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        commenting: profile.commentedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        sharing: profile.sharedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        following: profile.followedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        reacting: profile.reactedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
    };
}

function similarityGuard(a: WeightedNode<TopicNodeId>[], b: WeightedNode<TopicNodeId>[]) {
    return a.length > 0 && b.length > 0 ? calculateSimilarity(a, b) : 0;
}

function calculateTasteScore(profile: UserProfile, id: ContentNodeId): number {
    const topics = getRelated('topic', id, { count: 10 });
    return similarityGuard(
        profile.taste.map((t) => ({ id: getTopicId(t.label), weight: t.weight })),
        topics
    );
}

function sumTopicScores(topics: Map<TopicNodeId, number>, pref: WeightedNode<TopicNodeId>[]) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < pref.length; ++i) {
        const t = pref[i];
        const tscore = topics.get(t.id);
        if (tscore !== undefined) {
            sum += tscore * t.weight;
            count += tscore;
        } else {
            return 0;
        }
    }

    sum /= count;
    return count > 0 ? sum / count : 0;
}

function calculatePreferenceScores(preferences: Preferences, id: ContentNodeId, options?: ScoringOptions) {
    const topicsArray = getRelated('topic', id, { count: 10 });
    const topics = new Map<TopicNodeId, number>();
    topicsArray.forEach((t) => {
        topics.set(t.id, t.weight);
    });

    return {
        viewingPreferenceScore: options?.noViewingScore ? 0 : sumTopicScores(topics, preferences.viewing),
        commentingPreferenceScore: options?.noCommentingScore ? 0 : sumTopicScores(topics, preferences.commenting),
        sharingPreferenceScore: options?.noSharingScore ? 0 : sumTopicScores(topics, preferences.sharing),
        reactionPreferenceScore: options?.noReactionScore ? 0 : sumTopicScores(topics, preferences.reacting),
        followingPreferenceScore: options?.noFollowingScore ? 0 : sumTopicScores(topics, preferences.following),
    };
}

function calculateCoengagementScore(userId: UserNodeId, contentId: ContentNodeId) {
    // Get all coengagements for content
    const coengagements = getRelated('coengaged', contentId, { count: 30 });

    // Check if the user has engaged with it
    let sum = 0;
    coengagements.forEach((e) => {
        const engaged = getEdgeWeights('engaged', userId, e.id)[0] || 0;
        sum += engaged;
    });

    return Math.min(1, sum / COENGAGEMENT_MAX);
}

const SEEN_TIME = 5 * 60 * 1000;

function getLastSeenTime(userId: UserNodeId, contentId: ContentNodeId): number {
    const edge = getEdge('seen', userId, contentId);
    if (edge) {
        const now = Date.now();
        const diff = now - edge.timestamp;
        const norm = Math.min(1, diff / SEEN_TIME);
        return 1 - norm;
    }
    return 0;
}

export function makeFeatureVectors(
    candidates: Recommendation[],
    profile: UserProfile,
    options?: ScoringOptions
): number[][] {
    const preferences = calculatePreferences(profile);

    return candidates.map((c) => {
        const tasteSimilarityScore = calculateTasteScore(profile, c.contentId);
        const {
            viewingPreferenceScore,
            commentingPreferenceScore,
            sharingPreferenceScore,
            reactionPreferenceScore,
            followingPreferenceScore,
        } = calculatePreferenceScores(preferences, c.contentId, options);

        const coengagementScore = options?.noCoengagementScore
            ? 0
            : calculateCoengagementScore(profile.id, c.contentId);

        const lastSeenTime = options?.noLastSeenScore ? 0 : getLastSeenTime(profile.id, c.contentId);

        // userTasteSimilarity
        // userEngagementsSimilarity
        // coengagementScore
        // bestTopicAffinity
        // lastSeenTime (negative)
        // priorEngagements

        return [
            tasteSimilarityScore,
            sharingPreferenceScore,
            commentingPreferenceScore,
            followingPreferenceScore,
            reactionPreferenceScore,
            viewingPreferenceScore,
            0,
            coengagementScore,
            lastSeenTime,
        ];
    });
}
