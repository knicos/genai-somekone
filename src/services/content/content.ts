import { ContentMetadata } from '../../types/content';
import { addNode, addEdge } from '../graph/graph';
import { getTopicId } from '../concept/concept';

const dataStore = new Map<string, string>();
const metaStore = new Map<string, ContentMetadata>();

export function getContentData(id: string) {
    return dataStore.get(id);
}

export function getContentMetadata(id: string) {
    return metaStore.get(id);
}

export function addContent(data: string, meta: ContentMetadata) {
    dataStore.set(meta.id, data);
    metaStore.set(meta.id, meta);

    addNode('content', meta.id);
    meta.labels.forEach((l) => {
        const tid = getTopicId(l.label);
        addEdge('topic', meta.id, tid, l.weight);
        addEdge('content', tid, meta.id, l.weight);
    });
}

export function reset() {
    dataStore.clear();
    metaStore.clear();
}
