import { describe, it } from 'vitest';
import { biasedUniqueSubset, uniformUniqueSubset } from './subsets';

describe('uniformUnigueSubset', () => {
    it('returns all if too few items', async ({ expect }) => {
        const result = uniformUniqueSubset([1, 2, 3], 5, (v) => v);
        expect(result).toHaveLength(3);
    });

    it('removes duplicates even if too few', async ({ expect }) => {
        const result = uniformUniqueSubset([1, 1, 2, 3], 5, (v) => v);
        expect(result).toHaveLength(3);
    });

    it('removes duplicates', async ({ expect }) => {
        const result = uniformUniqueSubset([1, 1, 2, 3], 3, (v) => v);
        expect(result).toHaveLength(3);
        expect(result).toContain(1);
        expect(result).toContain(2);
        expect(result).toContain(3);
    });

    it('select the required number', async ({ expect }) => {
        const result = uniformUniqueSubset([1, 2, 3, 4, 5, 6, 7, 8], 4, (v) => v);
        expect(result).toHaveLength(4);
    });
});

describe('biasedUnigueSubset', () => {
    it('returns all if too few items', async ({ expect }) => {
        const result = biasedUniqueSubset([1, 2, 3], 5, (v) => v);
        expect(result).toHaveLength(3);
    });

    it('removes duplicates even if too few', async ({ expect }) => {
        const result = biasedUniqueSubset([1, 1, 2, 3], 5, (v) => v);
        expect(result).toHaveLength(3);
    });

    it('removes duplicates', async ({ expect }) => {
        const result = biasedUniqueSubset([1, 1, 2, 3], 3, (v) => v);
        expect(result).toHaveLength(3);
        expect(result).toContain(1);
        expect(result).toContain(2);
        expect(result).toContain(3);
    });

    it('select the required number', async ({ expect }) => {
        const result = biasedUniqueSubset([1, 2, 3, 4, 5, 6, 7, 8], 4, (v) => v);
        expect(result).toHaveLength(4);
    });
});
