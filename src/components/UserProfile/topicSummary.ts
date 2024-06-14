import { UserNodeData } from '@genaism/services/users/userTypes';

export interface TopicSummaryItem {
    label: string;
    percent: number;
    count: number;
    total: number;
}

export interface TopicSummary {
    shared: TopicSummaryItem[];
    commented: TopicSummaryItem[];
    viewed: TopicSummaryItem[];
    followed: TopicSummaryItem[];
    reacted: TopicSummaryItem[];
    sharedPercent: number;
    commentedPercent: number;
    followedPercent: number;
    viewedPercent: number;
    reactedPercent: number;
}

export default function topicSummary(profile: UserNodeData): TopicSummary {
    const seen = new Map<string, number>();
    profile.affinities.topics.seenTopics.forEach((t) => {
        seen.set(t.label, t.weight);
    });
    const sumSeen = profile.affinities.topics.seenTopics.reduce((sum, v) => sum + v.weight, 0);

    const shared = profile.affinities.topics.sharedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const commented = profile.affinities.topics.commentedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const viewed = profile.affinities.topics.viewedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const followed = profile.affinities.topics.followedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const reacted = profile.affinities.topics.reactedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));

    const sumShared = profile.affinities.topics.sharedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumCommented = profile.affinities.topics.commentedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumViewed = profile.affinities.topics.viewedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumFollowed = profile.affinities.topics.followedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumReacted = profile.affinities.topics.reactedTopics.reduce((sum, v) => sum + v.weight, 0);

    return {
        shared,
        commented,
        viewed,
        followed,
        reacted,
        sharedPercent: sumShared / sumSeen,
        commentedPercent: sumCommented / sumSeen,
        viewedPercent: sumViewed / sumSeen,
        followedPercent: sumFollowed / sumSeen,
        reactedPercent: sumReacted / sumSeen,
    };
}
