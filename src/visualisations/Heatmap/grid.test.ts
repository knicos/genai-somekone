import { describe, it } from 'vitest';
import { findNearestSlot, heatmapGrid } from './grid';
import { getContentService } from '@knicos/genai-recom';

describe('Grid findNearestSlot', () => {
    it('finds the first slot if empty', async ({ expect }) => {
        const grid = [
            [null, null, null],
            [null, null, null],
            [null, null, null],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 5);
        expect(nearest[0]).toBe(1);
        expect(nearest[1]).toBe(1);
    });

    it('finds immediate neighbour if empty', async ({ expect }) => {
        const grid = [
            [null, null, null],
            [null, 1, null],
            [null, null, null],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 5);
        expect(nearest[0]).toBe(1);
        expect(nearest[1]).toBe(0);
    });

    it('finds nearest neighbour', async ({ expect }) => {
        const grid = [
            [null, 1, null],
            [null, 1, 1],
            [null, 1, null],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 5);
        expect(nearest[0]).toBe(0);
        expect(nearest[1]).toBe(1);
    });

    it('finds only empty slot', async ({ expect }) => {
        const grid = [
            [1, 1, 1],
            [1, 1, 1],
            [null, 1, 1],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 5);
        expect(nearest[0]).toBe(0);
        expect(nearest[1]).toBe(2);
    });

    it('fails if no slots', async ({ expect }) => {
        const grid = [
            [1, 1, 1],
            [1, 1, 1],
            [1, 1, 1],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 5);
        expect(nearest[0]).toBe(-1);
        expect(nearest[1]).toBe(-1);
    });

    it('fails if distance is exceeded', async ({ expect }) => {
        const grid = [
            [1, 1, null],
            [1, 1, 1],
            [1, 1, 1],
        ];
        const nearest = findNearestSlot(grid, [1, 1], 1);
        expect(nearest[0]).toBe(-1);
        expect(nearest[1]).toBe(-1);
    });
});

describe('Grid heatmapGrid()', () => {
    it('completely fills a grid', async ({ expect }) => {
        const grid = heatmapGrid(
            getContentService(),
            ['content:1', 'content:2', 'content:3', 'content:4', 'content:5'],
            2
        );
        expect(grid).toHaveLength(2);
        expect(grid[0]).toHaveLength(2);
        expect(grid[0][0]).not.toBe(null);
        expect(grid[0][1]).not.toBe(null);
        expect(grid[1][0]).not.toBe(null);
        expect(grid[1][1]).not.toBe(null);
    });
});
