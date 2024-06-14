import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { clusterEmbeddings } from '@genaism/util/embedding';

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
