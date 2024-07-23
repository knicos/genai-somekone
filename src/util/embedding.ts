import { NodeID } from '@genaism/services/graph/graphTypes';
import HierarchicalEmbeddingCluster, { ClusterOptions } from './embeddings/clustering';
import { Embedding } from './embeddings/general';

export type { Embedding } from './embeddings/general';
export { embeddingLength, normalise, weightedMeanEmbedding, meanEmbedding } from './embeddings/general';
export { cosinesim, normCosinesim, embeddingSimilarity, maxEmbeddingDistance } from './embeddings/similarity';

/** Complete linkage aglomorative hierarchical clustering with k cluster restriction */
export function clusterEmbeddings(
    data: { id: NodeID; embedding: Embedding }[],
    { k = 2, maxDistance = 1, minClusterSize = 1000 }: ClusterOptions
) {
    const clusterer = new HierarchicalEmbeddingCluster({ k, maxDistance, minClusterSize });
    clusterer.calculate(data);
    return clusterer.getClusters();
}
