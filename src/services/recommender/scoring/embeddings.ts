import { getContentMetadata } from '@genaism/services/content/content';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { UserEmbeddings, UserNodeData } from '@genaism/services/users/userTypes';
import { normCosinesim } from '@genaism/util/embedding';

// Determined by experiment, embeddings always have some degree of similarity so remove that.
const BASE_EMBEDDING_SIMILARITY = 0.8;

type EmbeddingTypes = keyof UserEmbeddings;

export function calculateEmbeddingScore(
    name: EmbeddingTypes,
    profile: UserNodeData,
    id: ContentNodeId
): number | undefined {
    const meta = getContentMetadata(id);
    if (meta && meta.embedding && profile.embeddings[name].length > 0) {
        const sim = normCosinesim(meta.embedding, profile.embeddings[name]);
        return Math.max(0, (sim - BASE_EMBEDDING_SIMILARITY) / (1 - BASE_EMBEDDING_SIMILARITY));
    }
}
