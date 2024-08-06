import { GraphService, TopicNodeId, WeightedNode } from '@knicos/genai-recom';

export function topicUserSimilarity(graph: GraphService, id: TopicNodeId): WeightedNode<TopicNodeId>[] {
    const scores = new Map<TopicNodeId, number>();
    const users = graph.getRelated('topic', id, { count: 10 });
    users.forEach((user) => {
        const topics = graph.getRelated('topic', user.id, { count: 10 });
        topics.forEach((topic) => {
            const w = user.weight * topic.weight;
            if (w > 0) scores.set(topic.id, (scores.get(topic.id) || 0) + w);
        });
    });

    return Array.from(scores).map(([topicId, score]) => ({ id: topicId, weight: score }));
}
