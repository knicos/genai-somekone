export type Embedding = number[];

export function embeddingLength(e: Embedding) {
    return Math.sqrt(e.reduce((s, v) => s + v * v, 0));
}

export function normalise(vec: Embedding): Embedding {
    const sum = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (sum === 0) return vec;
    return vec.map((v) => v / sum);
}

export function cosinesim(A: Embedding, B: Embedding): number {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < A.length; ++i) {
        dotproduct += A[i] * B[i];
        mA += A[i] * A[i];
        mB += B[i] * B[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    const similarity = dotproduct / (mA * mB);

    return similarity;
}

export function normCosinesim(A: Embedding, B: Embedding): number {
    return A.reduce((d, v, i) => d + v * B[i], 0);
}

export function embeddingSimilarity(a: Embedding, b: Embedding) {
    if (a.length !== b.length) return 0;
    return cosinesim(a, b);
}

export function weightedMeanEmbedding(em: Embedding[], w: number[]): number[] {
    const sw = w.reduce((t, ww) => t + ww, 0);
    const out = new Array<number>(em[0]?.length || 0);
    out.fill(0);
    em.forEach((e, i) => {
        e.forEach((ee, j) => {
            out[j] += ee * w[i];
        });
    });
    out.forEach((_, ix) => {
        out[ix] /= sw;
    });
    return out;
}

export function meanEmbedding(em: Embedding[]) {
    const out = new Array<number>(em[0]?.length || 0);
    out.fill(0);
    em.forEach((e) => {
        e.forEach((ee, j) => {
            out[j] += ee;
        });
    });
    out.forEach((_, ix) => {
        out[ix] /= em.length;
    });
    return out;
}

function maxEmbeddingDistance(a: Embedding[], b: Embedding[]) {
    let m = 0;

    for (let i = 0; i < a.length; ++i) {
        for (let j = 0; j < b.length; ++j) {
            if (a[i] === b[j]) continue;
            const s = normCosinesim(a[i], b[j]);
            m = Math.max(m, 1 - s);
        }
    }

    return m;
}

interface ClusterNode {
    active: boolean;
    members: number[];
    distances: number[];
}

export interface ClusterOptions {
    k?: number;
    maxDistance?: number;
    minClusterSize?: number;
}

/** Complete linkage aglomorative hierarchical clustering with k cluster restriction */
export function clusterEmbeddings(
    data: Embedding[],
    { k = 2, maxDistance = 1, minClusterSize = 1000 }: ClusterOptions
) {
    const start = performance.now();
    const clusters: ClusterNode[] = data.map((_, ix) => ({
        members: [ix],
        active: true,
        distances: data.map((d) => 1 - normCosinesim(d, data[ix])),
    }));
    const minPair = { d: 0, a: -1, b: -1 };

    if (data.length > 0) {
        const l = embeddingLength(data[0]);
        if (Math.abs(l - 1) > Number.EPSILON) {
            throw new Error('Embeddings are not normalised');
        }
    }

    let count = clusters.length;
    let csize = 1;

    while (count > k && minPair.d <= maxDistance && csize < minClusterSize) {
        minPair.d = 1; // Reset distance
        csize = clusters.length;
        // Find minimum distance
        for (let i = 0; i < clusters.length; ++i) {
            if (clusters[i].active === false) continue;
            csize = Math.min(csize, clusters[i].members.length);

            for (let j = i + 1; j < clusters.length; ++j) {
                if (clusters[j].active === false) continue;

                const dist = clusters[i].distances[j];
                if (dist < minPair.d) {
                    minPair.d = dist;
                    minPair.a = i;
                    minPair.b = j;
                }
            }
        }

        // Merge min
        clusters[minPair.a].members.push(...clusters[minPair.b].members);
        clusters[minPair.b].active = false;

        // Only update the distances that changed.
        const cembed = clusters[minPair.a].members.map((m) => data[m]);
        clusters.forEach((c, ix) => {
            if (c.active && ix !== minPair.a) {
                const d = maxEmbeddingDistance(
                    c.members.map((m) => data[m]),
                    cembed
                );
                c.distances[minPair.a] = d;
                clusters[minPair.a].distances[ix] = d;
            }
        });
        --count;
    }

    const end = performance.now();
    console.log('Cluster time = ', end - start);
    const filtered = clusters.filter((c) => c.active);
    return filtered.map((c) => c.members);
}
