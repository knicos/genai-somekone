import { Embedding, clusterEmbeddings } from '@genaism/util/embedding';
import { UserNodeId } from '../graph/graphTypes';
import { addAnyProfileListener } from '../profiler/events';
import { getUserData } from '../users/users';
import EmbeddingIndex from './indexer';
import { WeightedLabel } from '../content/contentTypes';
import { getUserProfile } from '../profiler/profiler';
import { mapEmbeddingsToPoints } from '../content/mapping';

const index = new EmbeddingIndex<UserNodeId>();

addAnyProfileListener((id: UserNodeId) => {
    const profile = getUserData(id)?.embeddings.taste;
    if (profile) {
        index.add(id, profile);
    }
});

export function getSimilarUsers(embedding: Embedding, count: number) {
    return index.search(embedding, { count });
}

export async function mapUsersToPoints(users: UserNodeId[]) {
    const fUsers = users.filter((u) => (getUserData(u)?.embeddings.taste.length || 0) > 0);
    if (fUsers.length === 0) return [];
    const embeddings = fUsers.map((u) => getUserData(u)?.embeddings.taste || []);
    const points = await mapEmbeddingsToPoints(embeddings);
    return points.map((p, ix) => ({ id: fUsers[ix], point: p }));
}

export function clusterUsers(users: UserNodeId[], k: number): Map<UserNodeId, WeightedLabel> {
    const clusters = new Map<UserNodeId, WeightedLabel>();

    const userEmbeddings = users
        .map((user) => ({ user, embedding: getUserProfile(user)?.embeddings.taste || [] }))
        .filter((u) => u.embedding.length > 0);
    const embeddings = userEmbeddings.map((u) => u.embedding);
    const rawClusters = clusterEmbeddings(embeddings, { k });

    rawClusters.forEach((cluster, ix) => {
        cluster.forEach((member) => {
            clusters.set(userEmbeddings[member].user, { label: `cluster${ix}`, weight: 1 });
        });
    });

    return clusters;
}
