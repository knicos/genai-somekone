import { Embedding, normCosinesim } from '@genaism/util/embedding';
import { NodeID, WeightedNode } from '../graph/graphTypes';

/*interface IndexNode {
    embedding?: Embedding;
    children: IndexNode[];
}*/

export interface SearchOptions {
    count?: number;
    maxDistance?: number;
}

export default class EmbeddingIndex<T extends NodeID = NodeID> {
    private embeddings = new Map<T, Embedding>();
    //private root: IndexNode = {children: []};

    add(id: T, embedding: Embedding) {
        this.embeddings.set(id, embedding);
    }

    remove(id: T) {
        this.embeddings.delete(id);
    }

    search(embedding: Embedding, options: SearchOptions): WeightedNode<T>[] {
        if (embedding.length === 0) return [];

        const es: WeightedNode<T>[] = [];
        this.embeddings.forEach((v, k) => {
            if (v === embedding) return;
            const s = normCosinesim(v, embedding);
            es.push({ id: k, weight: s });
        });
        es.sort((a, b) => b.weight - a.weight);

        if (options.count) {
            return es.slice(0, options.count);
        } else if (options.maxDistance) {
            return es.filter((e) => e.weight <= (options.maxDistance || 0));
        }
        return es;
    }

    searchById(id: T, options: SearchOptions): WeightedNode<T>[] {
        const e = this.embeddings.get(id);
        if (e) return this.search(e, options);
        return [];
    }
}
