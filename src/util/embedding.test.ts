import { describe, it } from 'vitest';
import { cosinesim, embeddingLength, normCosinesim, normalise, weightedMeanEmbedding } from './embedding';

describe('embeddingLength()', () => {
    it('returns the correct length for one item', ({ expect }) => {
        const l = embeddingLength([0.5]);
        expect(l).toBeCloseTo(0.5);
    });

    it('returns the correct length for one item', ({ expect }) => {
        const l = embeddingLength([2, 4, -2]);
        expect(l).toBeCloseTo(4.898979486);
    });
});

describe('normCosinesim()', () => {
    it('generates the expected similarity', ({ expect }) => {
        const s = normCosinesim(normalise([2, 3, 8, 1]), normalise([3, 3, 6, 2]));
        expect(s).toBeCloseTo(0.966389);
    });
});

describe('cosinesim()', () => {
    it('generates the expected similarity', ({ expect }) => {
        const s = cosinesim([2, 3, 8, 1], [3, 3, 6, 2]);
        expect(s).toBeCloseTo(0.966389);
    });
});

describe('weightedMeanEmbedding()', () => {
    it('can weight a single embedding', ({ expect }) => {
        const e = weightedMeanEmbedding([normalise([1, 4, 5])], [0.2]);
        expect(e).toEqual(normalise([1, 4, 5]));
    });

    it('can weight two embeddings', ({ expect }) => {
        const e = weightedMeanEmbedding(
            [
                [1, 4, 5],
                [3, 6, 7],
            ],
            [0.5, 0.5]
        );
        expect(e).toEqual([2, 5, 6]);
    });
});
