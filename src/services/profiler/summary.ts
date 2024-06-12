import { getTopicLabel } from '../concept/concept';
import { UserNodeId } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { ProfileSummary } from './profilerTypes';
import { getCurrentUser } from './state';

const TIME_WINDOW = 10 * 60 * 1000;
const TIME_DECAY = 0.2;

export function findTopicProfileById(id: UserNodeId, count?: number) {
    return getRelated('topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((v) => ({
        label: getTopicLabel(v.id),
        weight: v.weight,
    }));
}

export function findTopContentById(id: UserNodeId, count?: number) {
    return getRelated('engaged', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY });
}

export function findTopicProfile(count?: number) {
    return findTopicProfileById(getCurrentUser(), count);
}

export function findTopContent(count?: number) {
    return findTopContentById(getCurrentUser(), count);
}

export function createProfileSummary(count?: number): ProfileSummary {
    return createProfileSummaryById(getCurrentUser(), count);
}

export function createProfileSummaryById(id: UserNodeId, count?: number): ProfileSummary {
    const topics = findTopicProfileById(id, count);
    const engagedContent = findTopContentById(id, count);

    return {
        topics,
        engagedContent,
        commentedTopics: getRelated('commented_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        seenTopics: getRelated('seen_topic', id, { period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((r) => ({
            label: getTopicLabel(r.id),
            weight: r.weight,
        })),
        sharedTopics: getRelated('shared_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        followedTopics: getRelated('followed_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        reactedTopics: getRelated('reacted_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
        viewedTopics: getRelated('viewed_topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map(
            (r) => ({
                label: getTopicLabel(r.id),
                weight: r.weight,
            })
        ),
    };
}
