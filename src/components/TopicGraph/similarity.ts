import { TopicNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getRelated } from '@genaism/services/graph/query';

export function topicUserSimilarity(id: TopicNodeId): WeightedNode<TopicNodeId>[] {
    const scores = new Map<TopicNodeId, number>();
    const users = getRelated('topic', id, { count: 10 });
    users.forEach((user) => {
        const topics = getRelated('topic', user.id, { count: 10 });
        topics.forEach((topic) => {
            const w = user.weight * topic.weight;
            if (w > 0) scores.set(topic.id, (scores.get(topic.id) || 0) + w);
        });
    });

    return Array.from(scores).map(([topicId, score]) => ({ id: topicId, weight: score }));
}
