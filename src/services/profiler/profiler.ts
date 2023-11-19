import { LogEntry } from './profilerTypes';
import { addOrAccumulateEdge, getRelated } from '@genaism/services/graph/graph';
import { getCurrentUser } from '../users/users';

/*function updateParentAffinity(topic: string) {
    const parent = getTopicParent(topic);

    if (parent) {
        const children = getTopicChildren(parent.id);
        const childAffinities = getEdgeWeights(
            'topic',
            userID,
            children.map((c) => c.id)
        );
        const affinity = children.reduce((a, child, ix) => {
            return a + child.weight * childAffinities[ix];
        }, 0);
        addEdge('topic', userID, parent.id, affinity);
        updateParentAffinity(parent.id);
    }
}*/

function affinityBoost(content: string, weight: number) {
    const topics = getRelated('topic', content || '');
    topics.forEach((t) => {
        addOrAccumulateEdge('topic', getCurrentUser(), t.id, t.weight * weight);
    });

    addOrAccumulateEdge('engaged', getCurrentUser(), content, weight);

    // For each parent topic, recalculate user affinity for those topics
    /*topics.forEach((t) => {
        updateParentAffinity(t.id);
    });*/
}

export function addLogEntry(data: LogEntry) {
    switch (data.activity) {
        case 'like':
            affinityBoost(data.id || '', 0.1);
            break;
        case 'laugh':
        case 'anger':
        case 'sad':
        case 'wow':
        case 'love':
            affinityBoost(data.id || '', 0.2);
            break;
        case 'share_public':
            affinityBoost(data.id || '', 0.5);
            break;
        case 'share_private':
            affinityBoost(data.id || '', 0.1);
            break;
        case 'share_friends':
            affinityBoost(data.id || '', 0.3);
            break;
    }
}
