import { ContentMetadata } from './contentTypes';
import { addNode, addEdge, removeNode } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';

const dataStore = new Map<string, string>();
const metaStore = new Map<string, ContentMetadata>();

export function resetContent() {
    for (const n of metaStore) {
        removeNode(n[0]);
    }
    dataStore.clear();
    metaStore.clear();
}

export function getContentData(id: string) {
    return dataStore.get(id);
}

export function getContentMetadata(id: string) {
    return metaStore.get(id);
}

export function hasContent(id: string): boolean {
    return metaStore.has(id);
}

export function addContent(data: string, meta: ContentMetadata) {
    dataStore.set(meta.id, data);
    metaStore.set(meta.id, meta);

    try {
        addNode('content', meta.id);
        meta.labels.forEach((l) => {
            const tid = getTopicId(l.label);
            addEdge('topic', meta.id, tid, l.weight);
            addEdge('content', tid, meta.id, l.weight);
        });
    } catch (e) {
        console.warn(e);
    }
}
