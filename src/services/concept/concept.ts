import { WeightedNode } from '../graph/graphTypes';
import { addEdge, addNode, getRelated } from '../graph/graph';

const topicStore = new Map<string, string>();
const topicLabelIndex = new Map<string, string>();

export function addTopic(label: string, weight: number, parent?: string) {
    const id = addNode('topic');
    topicStore.set(id, label);
    topicLabelIndex.set(label, id);

    if (parent) {
        addEdge('parent', id, parent, weight);
        addEdge('child', parent, id, weight);
    }

    return id;
}

export function getTopicId(label: string): string {
    const t = topicLabelIndex.get(label);
    if (!t) {
        return addTopic(label, 0);
    }
    return t;
}

export function getTopicLabel(id: string): string {
    return topicStore.get(id) || id;
}

export function getTopicParent(id: string): WeightedNode | null {
    const parents = getRelated('parent', id);
    return parents.length > 0 ? parents[0] : null;
}

export function getTopicChildren(id: string): WeightedNode[] {
    return getRelated('child', id);
}
