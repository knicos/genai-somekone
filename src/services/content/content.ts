import { CommentEntry, ContentMetadata, ContentStats, ContentStatsId } from './contentTypes';
import { addNode, addEdge, removeNode, getNodesByType } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { ContentNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { isDisallowedTopic } from './disallowed';
import { anonString } from '@genaism/util/anon';
import { Embedding, embeddingSimilarity, normalise } from '@genaism/util/embedding';

const dataStore = new Map<ContentNodeId, string>();
const metaStore = new Map<ContentNodeId, ContentMetadata>();
const commentStore = new Map<ContentNodeId, CommentEntry[]>();
const statsStore = new Map<ContentNodeId, ContentStats>();

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

export function rebuildContent() {
    metaStore.forEach((meta) => {
        try {
            const cid = addNode('content', `content:${meta.id}`, {
                author: meta.author,
                caption: meta.caption,
            });

            meta.labels.forEach((l) => {
                if (l.weight > 0) {
                    const isdis = isDisallowedTopic(l.label);
                    const tid = getTopicId(l.label);
                    addEdge('topic', cid, tid, isdis ? l.weight * 0.1 : l.weight);
                    addEdge('content', tid, cid, isdis ? l.weight * 0.1 : l.weight);
                }
            });
        } catch (e) {
            console.warn(e);
        }
    });
}

export function addContent(data: string, meta: ContentMetadata) {
    dataStore.set(`content:${meta.id}`, data);
    metaStore.set(`content:${meta.id}`, meta);

    if (meta.embedding) {
        // Ensure this since we rely on it.
        meta.embedding = normalise(meta.embedding);
    }

    try {
        const cid = addNode('content', `content:${meta.id}`, {
            author: meta.author,
            caption: meta.caption,
        });
        meta.labels.forEach((l) => {
            if (l.weight > 0) {
                const isdis = isDisallowedTopic(l.label);
                const tid = getTopicId(l.label);
                addEdge('topic', cid, tid, isdis ? l.weight * 0.1 : l.weight);
                addEdge('content', tid, cid, isdis ? l.weight * 0.1 : l.weight);
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

export function addComment(id: ContentNodeId, user: UserNodeId, comment: string, ts: number) {
    const comments = commentStore.get(id) || [];
    comments.push({ userId: user, comment, timestamp: ts });
    comments.sort((a, b) => b.timestamp - a.timestamp);
    commentStore.set(id, comments);
}

export function removeCommentsBy(id: UserNodeId) {
    commentStore.forEach((comment, key) => {
        commentStore.set(
            key,
            comment.filter((c) => c.userId !== id)
        );
    });
}

export function anonComments() {
    commentStore.forEach((item) => {
        item.forEach((comment) => {
            comment.comment = anonString(comment.comment);
        });
    });
}

export function getComments(id: ContentNodeId): CommentEntry[] {
    return commentStore.get(id) || [];
}

export interface CommentDataItem {
    content: ContentNodeId;
    comments: CommentEntry[];
}

export function dumpComments(): CommentDataItem[] {
    const result: CommentDataItem[] = [];
    commentStore.forEach((value, key) => {
        result.push({ content: key, comments: value });
    });

    return result;
}

function createEmptyStats() {
    return { reactions: 0, shares: 0, views: 0, engagement: 0 };
}

export function addContentReaction(id: ContentNodeId) {
    const stats = statsStore.get(id) || createEmptyStats();
    stats.reactions += 1;
    statsStore.set(id, stats);
}

export function addContentEngagement(id: ContentNodeId, value: number) {
    const stats = statsStore.get(id) || createEmptyStats();
    stats.engagement += value;
    statsStore.set(id, stats);
}

export function removeContentReaction(id: ContentNodeId) {
    const stats = statsStore.get(id) || createEmptyStats();
    stats.reactions -= 1;
    statsStore.set(id, stats);
}

export function addContentShare(id: ContentNodeId) {
    const stats = statsStore.get(id) || createEmptyStats();
    stats.shares += 1;
    statsStore.set(id, stats);
}

export function updateContentStats(stats: ContentStatsId[]) {
    stats.forEach((s) => {
        const old = statsStore.get(s.id) || createEmptyStats();
        old.reactions = Math.max(old.reactions, s.reactions);
        statsStore.set(s.id, s);
    });
}

export function getContentStats(id: ContentNodeId[]): ContentStats[];
export function getContentStats(id: ContentNodeId): ContentStats;
export function getContentStats(id: ContentNodeId | ContentNodeId[]): ContentStats | ContentStats[] {
    if (Array.isArray(id)) {
        return id.map((i) => ({ id: i, ...(statsStore.get(i) || createEmptyStats()) }));
    } else {
        return statsStore.get(id) || createEmptyStats();
    }
}

export function getSimilarContent(embedding: Embedding, count?: number, nodes?: ContentNodeId[]) {
    const anodes = nodes || getNodesByType('content');

    const sims: WeightedNode<ContentNodeId>[] = [];
    anodes.forEach((n) => {
        const meta = getContentMetadata(n);
        if (meta && meta.embedding) {
            const sim = embeddingSimilarity(embedding, meta.embedding);
            sims.push({ id: n, weight: sim });
        }
    });

    sims.sort((a, b) => b.weight - a.weight);
    return count ? sims.slice(0, count) : sims;
}
