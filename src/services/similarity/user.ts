import { Embedding } from '@genaism/util/embedding';
import { UserNodeId } from '../graph/graphTypes';
import { addAnyProfileListener } from '../profiler/events';
import { getUserData } from '../users/users';
import EmbeddingIndex from './indexer';

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
