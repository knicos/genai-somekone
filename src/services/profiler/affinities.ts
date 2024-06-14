import { getTopicLabel } from '../concept/concept';
import { UserNodeId } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { ContentAffinities, TopicAffinities, UserAffinities } from '../users/userTypes';

const TIME_WINDOW = 60 * 60 * 1000;
const TIME_DECAY = 0.2;

export function getTopicAffinities(id: UserNodeId, count: number): TopicAffinities {
    return {
        topics: getRelated('topic', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }).map((v) => ({
            label: getTopicLabel(v.id),
            weight: v.weight,
        })),
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

export function getContentAffinities(id: UserNodeId, count: number): ContentAffinities {
    return {
        contents: getRelated('engaged', id, { count, period: TIME_WINDOW, timeDecay: TIME_DECAY }),
    };
}

export function getUserAffinities(): UserAffinities {
    return {
        users: [],
    };
}
