import { ContentNodeId, TopicNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { ScoringOptions } from '../recommenderTypes';
import { getRelated } from '@genaism/services/graph/query';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { getTopicId } from '@genaism/services/concept/concept';

interface Preferences {
    viewing: WeightedNode<TopicNodeId>[];
    commenting: WeightedNode<TopicNodeId>[];
    sharing: WeightedNode<TopicNodeId>[];
    following: WeightedNode<TopicNodeId>[];
    reacting: WeightedNode<TopicNodeId>[];
}

export function calculateAffinities(profile: UserNodeData): Preferences {
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

function sumTopicScores(topics: Map<TopicNodeId, number>, pref: WeightedNode<TopicNodeId>[]) {
    let sum = 0;
    let count = 0;
    for (let i = 0; i < pref.length; ++i) {
        const t = pref[i];
        const tscore = topics.get(t.id);
        if (tscore !== undefined) {
            sum += tscore * t.weight;
            count += tscore;
        }
    }

    return count > 0 ? sum / count : 0;
}

export function calculateAffinityScores(preferences: Preferences, id: ContentNodeId, options?: ScoringOptions) {
    const topicsArray = getRelated('topic', id, { count: 10 });
    const topics = new Map<TopicNodeId, number>();
    topicsArray.forEach((t) => {
        topics.set(t.id, t.weight);
    });

    const affinities = {
        viewingPreferenceScore: options?.noViewingScore ? 0 : sumTopicScores(topics, preferences.viewing),
        commentingPreferenceScore: options?.noCommentingScore ? 0 : sumTopicScores(topics, preferences.commenting),
        sharingPreferenceScore: options?.noSharingScore ? 0 : sumTopicScores(topics, preferences.sharing),
        reactionPreferenceScore: options?.noReactionScore ? 0 : sumTopicScores(topics, preferences.reacting),
        followingPreferenceScore: options?.noFollowingScore ? 0 : sumTopicScores(topics, preferences.following),
    };

    return affinities;
}
