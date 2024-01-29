import { TopicNodeId, WeightedNode } from '../graph/graphTypes';
import { addEdge, addNode, getNodeData, getRelated } from '../graph/graph';
import { addNodeTypeListener } from '../graph/events';

const topicStore = new Map<TopicNodeId, string>();
const topicLabelIndex = new Map<string, TopicNodeId>();

interface TopicData {
    label: string;
}

addNodeTypeListener('topic', (id: TopicNodeId) => {
    const data = getNodeData<TopicData>(id);
    if (data) {
        topicStore.set(id, data.label);
        topicLabelIndex.set(data.label, id);
    }
});

export function addTopic(label: string, weight: number, parent?: TopicNodeId): TopicNodeId {
    const id = addNode('topic', `topic:${label}`, { label });
    //topicStore.set(id, label);
    //topicLabelIndex.set(label, id);

    if (parent) {
        addEdge('parent', id, parent, weight);
        addEdge('child', parent, id, weight);
    }

    return id;
}

export function getTopicId(label: string): TopicNodeId {
    const t = topicLabelIndex.get(label);
    if (!t) {
        return addTopic(label, 0);
    }
    return t;
}

export function getTopicLabel(id: TopicNodeId): string {
    return topicStore.get(id) || id;
}

export function getTopicParent(id: TopicNodeId): WeightedNode<TopicNodeId> | null {
    const parents = getRelated('parent', id);
    return parents.length > 0 ? parents[0] : null;
}

export function getTopicChildren(id: TopicNodeId): WeightedNode<TopicNodeId>[] {
    return getRelated('child', id);
}

export function resetTopics() {
    topicStore.clear();
    topicLabelIndex.clear();
}
