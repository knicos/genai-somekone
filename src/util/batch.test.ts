import { describe, it } from 'vitest';
import { batchMap } from './batch';

describe('batchMap()', () => {
    it('maps all items', async ({ expect }) => {
        const data = new Array(100).fill(0);
        const mapped = await batchMap(data, 20, (v) => v + 1);
        const sum = mapped.reduce((s, v) => s + v, 0);
        expect(sum).toBe(100);
    });
});
