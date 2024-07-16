import { normCosinesim } from '@genaism/util/embedding';
import { getTopicId } from '../concept/concept';
import { getContentMetadata, getContentStats, getMaxContentEngagement } from '../content/content';
import { getEdge, getEdgeWeights } from '../graph/edges';
import { ContentNodeId, TopicNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { Recommendation, Scores, ScoringOptions } from './recommenderTypes';
import { UserNodeData } from '../users/userTypes';

const COENGAGEMENT_MAX = 4;
const BASE_EMBEDDING_SIMILARITY = 0.8;

interface Preferences {
    viewing: WeightedNode<TopicNodeId>[];
    commenting: WeightedNode<TopicNodeId>[];
    sharing: WeightedNode<TopicNodeId>[];
    following: WeightedNode<TopicNodeId>[];
    reacting: WeightedNode<TopicNodeId>[];
}

function calculatePreferences(profile: UserNodeData): Preferences {
    const seenTopicMap = new Map<string, number>();
    profile.affinities.topics.seenTopics.forEach((s) => {
        seenTopicMap.set(s.label, s.weight);
    });

    return {
        viewing: profile.affinities.topics.viewedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        commenting: profile.affinities.topics.commentedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        sharing: profile.affinities.topics.sharedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        following: profile.affinities.topics.followedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
        reacting: profile.affinities.topics.reactedTopics.map((t) => ({
            id: getTopicId(t.label),
            weight: t.weight / (seenTopicMap.get(t.label) || 1),
        })),
    };
}

function calculateTasteScore(profile: UserNodeData, id: ContentNodeId): number {
    if (profile.embeddings.taste.length === 0) console.warn('No profile embedding');
    const meta = getContentMetadata(id);
    if (meta && meta.embedding && profile.embeddings.taste.length > 0) {
        const sim = normCosinesim(meta.embedding, profile.embeddings.taste);
        return Math.max(0, (sim - BASE_EMBEDDING_SIMILARITY) / (1 - BASE_EMBEDDING_SIMILARITY));
    }
    return 0;
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

// This depends on number of images available and classroom activity rate.
const SEEN_TIME = 2 * 60 * 1000;

function getLastSeenTime(userId: UserNodeId, contentId: ContentNodeId): number {
    const edge = getEdge('seen', userId, contentId);
    if (edge) {
        const now = Date.now();
        const diff = now - edge.timestamp;
        const norm = 1 - Math.min(1, diff / SEEN_TIME);
        return norm * norm;
    }
    return 0;
}

export function makeFeatures(
    userId: UserNodeId,
    candidates: Recommendation[],
    profile: UserNodeData,
    options?: ScoringOptions
): Scores[] {
    const preferences = calculatePreferences(profile);

    return candidates.map((c) => {
        const tasteSimilarityScore = options?.noTasteScore ? 0 : calculateTasteScore(profile, c.contentId);
        const {
            viewingPreferenceScore,
            commentingPreferenceScore,
            sharingPreferenceScore,
            reactionPreferenceScore,
            followingPreferenceScore,
        } = calculatePreferenceScores(preferences, c.contentId, options);

        const coengagementScore = options?.noCoengagementScore ? 0 : calculateCoengagementScore(userId, c.contentId);

        const lastSeenTime = options?.noLastSeenScore ? 0 : getLastSeenTime(userId, c.contentId);

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
