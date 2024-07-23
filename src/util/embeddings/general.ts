export type Embedding = number[];

export function embeddingLength(e: Embedding) {
    return Math.sqrt(e.reduce((s, v) => s + v * v, 0));
}

export function normalise(vec: Embedding): Embedding {
    const sum = Math.sqrt(vec.reduce((s, v) => s + v * v, 0));
    if (sum === 0) return vec;
    return vec.map((v) => v / sum);
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
