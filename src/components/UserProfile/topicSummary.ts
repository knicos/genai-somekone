import { getTopicLabel } from '@genaism/services/concept/concept';
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
}

export default function topicSummary(profile: UserProfile): TopicSummary {
    const seen = new Map<string, number>();
    profile.seenTopics.forEach((t) => {
        seen.set(t.id, t.weight);
    });

    const shared = profile.sharedTopics.map((s) => ({
        label: getTopicLabel(s.id),
        percent: s.weight / (seen.get(s.id) || 1),
        count: s.weight,
        total: seen.get(s.id) || 0,
    }));
    const commented = profile.commentedTopics.map((s) => ({
        label: getTopicLabel(s.id),
        percent: s.weight / (seen.get(s.id) || 1),
        count: s.weight,
        total: seen.get(s.id) || 0,
    }));
    const viewed = profile.viewedTopics.map((s) => ({
        label: getTopicLabel(s.id),
        percent: s.weight / (seen.get(s.id) || 1),
        count: s.weight,
        total: seen.get(s.id) || 0,
    }));
    const followed = profile.followedTopics.map((s) => ({
        label: getTopicLabel(s.id),
        percent: s.weight / (seen.get(s.id) || 1),
        count: s.weight,
        total: seen.get(s.id) || 0,
    }));
    const reacted = profile.reactedTopics.map((s) => ({
        label: getTopicLabel(s.id),
        percent: s.weight / (seen.get(s.id) || 1),
        count: s.weight,
        total: seen.get(s.id) || 0,
    }));

    return { shared, commented, viewed, followed, reacted };
}
