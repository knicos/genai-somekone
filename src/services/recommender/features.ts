import { getTopicId } from '../concept/concept';
import { ContentNodeId, TopicNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { UserProfile } from '../profiler/profilerTypes';
import { calculateSimilarity } from '../users/users';
import { Recommendation } from './recommenderTypes';

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

function calculatePreferenceScores(preferences: Preferences, id: ContentNodeId) {
    const topicsArray = getRelated('topic', id, { count: 10 });
    const topics = new Map<TopicNodeId, number>();
    topicsArray.forEach((t) => {
        topics.set(t.id, t.weight);
    });

    return {
        viewingPreferenceScore: sumTopicScores(topics, preferences.viewing),
        commentingPreferenceScore: sumTopicScores(topics, preferences.commenting),
        sharingPreferenceScore: sumTopicScores(topics, preferences.sharing),
        reactionPreferenceScore: sumTopicScores(topics, preferences.reacting),
        followingPreferenceScore: sumTopicScores(topics, preferences.following),
    };
}

export function makeFeatureVectors(candidates: Recommendation[], profile: UserProfile): number[][] {
    const preferences = calculatePreferences(profile);

    return candidates.map((c) => {
        const tasteSimilarityScore = calculateTasteScore(profile, c.contentId);
        const randomnessScore = Math.random() * 0.1;
        const {
            viewingPreferenceScore,
            commentingPreferenceScore,
            sharingPreferenceScore,
            reactionPreferenceScore,
            followingPreferenceScore,
        } = calculatePreferenceScores(preferences, c.contentId);

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
            randomnessScore,
        ];
    });
}
