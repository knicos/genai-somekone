import { Embedding } from './general';

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

export function maxEmbeddingDistance(a: Embedding[], b: Embedding[]) {
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
