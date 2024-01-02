import { UserProfile } from '@genaism/services/profiler/profilerTypes';

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

export default function topicSummary(profile: UserProfile): TopicSummary {
    const seen = new Map<string, number>();
    profile.seenTopics.forEach((t) => {
        seen.set(t.label, t.weight);
    });
    const sumSeen = profile.seenTopics.reduce((sum, v) => sum + v.weight, 0);

    const shared = profile.sharedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const commented = profile.commentedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const viewed = profile.viewedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const followed = profile.followedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));
    const reacted = profile.reactedTopics.map((s) => ({
        label: s.label,
        percent: s.weight / (seen.get(s.label) || 1),
        count: s.weight,
        total: seen.get(s.label) || 0,
    }));

    const sumShared = profile.sharedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumCommented = profile.commentedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumViewed = profile.viewedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumFollowed = profile.followedTopics.reduce((sum, v) => sum + v.weight, 0);
    const sumReacted = profile.reactedTopics.reduce((sum, v) => sum + v.weight, 0);

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
