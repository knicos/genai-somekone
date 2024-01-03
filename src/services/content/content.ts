import { ContentMetadata } from './contentTypes';
import { addNode, addEdge, removeNode } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { ContentNodeId } from '../graph/graphTypes';

const dataStore = new Map<ContentNodeId, string>();
const metaStore = new Map<ContentNodeId, ContentMetadata>();

export function resetContent() {
    for (const n of metaStore) {
        removeNode(n[0]);
    }
    dataStore.clear();
    metaStore.clear();
}

export function getContentData(id: ContentNodeId) {
    return dataStore.get(id);
}

export function getContentMetadata(id: ContentNodeId) {
    return metaStore.get(id);
}

export function hasContent(id: ContentNodeId): boolean {
    return metaStore.has(id);
}

export function addContent(data: string, meta: ContentMetadata) {
    dataStore.set(`content:${meta.id}`, data);
    metaStore.set(`content:${meta.id}`, meta);

    try {
        const cid = addNode('content', `content:${meta.id}`, {
            author: meta.author,
            caption: meta.caption,
        });
        meta.labels.forEach((l) => {
            if (l.weight > 0) {
                const tid = getTopicId(l.label);
                addEdge('topic', cid, tid, l.weight);
                addEdge('content', tid, cid, l.weight);
            }
        });
    } catch (e) {
        console.warn(e);
    }
}

export function removeContent(id: ContentNodeId) {
    dataStore.delete(id);
    metaStore.delete(id);
    removeNode(id);
}
