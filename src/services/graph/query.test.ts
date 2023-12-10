import { describe, it, beforeEach } from 'vitest';
import { resetGraph } from './state';
import { addNode } from './nodes';
import { addEdge } from './edges';
import { getRelated } from './query';

describe('graph.getRelated', () => {
    beforeEach(() => resetGraph());

    it('sorts the results by weight', async ({ expect }) => {
        const userIds = [addNode('user'), addNode('user'), addNode('user')];

        const contentIds = [addNode('content'), addNode('content'), addNode('content')];

        addEdge('engaged', userIds[0], contentIds[1], 1.0);
        addEdge('engaged', userIds[0], contentIds[0], 2.0);
        addEdge('engaged', userIds[0], contentIds[2], 3.0);
        addEdge('liked', userIds[0], contentIds[2], 4.0);
        addEdge('engaged', userIds[1], contentIds[1], 1.0);

        const related = getRelated('engaged', userIds[0]);

        expect(related).toHaveLength(3);
        expect(related[0].weight).toBe(3);
        expect(related[1].weight).toBe(2);
        expect(related[2].weight).toBe(1);
        expect(related[0].id).toBe(contentIds[2]);
    });

    it('limits the number of results', async ({ expect }) => {
        const userIds = [addNode('user'), addNode('user'), addNode('user')];

        const contentIds = [addNode('content'), addNode('content'), addNode('content')];

        addEdge('engaged', userIds[0], contentIds[1], 1.0);
        addEdge('engaged', userIds[0], contentIds[0], 2.0);
        addEdge('engaged', userIds[0], contentIds[2], 3.0);
        addEdge('liked', userIds[0], contentIds[2], 4.0);
        addEdge('engaged', userIds[1], contentIds[1], 1.0);

        const related = getRelated('engaged', userIds[0], { count: 2 });

        expect(related).toHaveLength(2);
        expect(related[0].weight).toBe(3);
        expect(related[1].weight).toBe(2);
        expect(related[0].id).toBe(contentIds[2]);
    });

    it('limits by time', async ({ expect }) => {
        const userIds = [addNode('user'), addNode('user'), addNode('user')];

        const contentIds = [addNode('content'), addNode('content'), addNode('content')];

        addEdge('engaged', userIds[0], contentIds[1], 1.0);
        addEdge('engaged', userIds[0], contentIds[0], 2.0);
        addEdge('engaged', userIds[0], contentIds[2], 3.0, 1000);
        addEdge('liked', userIds[0], contentIds[2], 4.0);
        addEdge('engaged', userIds[1], contentIds[1], 1.0);

        const related = getRelated('engaged', userIds[0], { count: 3, period: 5 * 60 * 1000 });

        expect(related).toHaveLength(2);
        expect(related[0].weight).toBe(2);
        expect(related[1].weight).toBe(1);
        expect(related[0].id).toBe(contentIds[0]);
    });

    it('weights by time', async ({ expect }) => {
        const userIds = [addNode('user'), addNode('user'), addNode('user')];

        const contentIds = [addNode('content'), addNode('content'), addNode('content')];

        addEdge('engaged', userIds[0], contentIds[1], 1.0);
        addEdge('engaged', userIds[0], contentIds[0], 2.0);
        addEdge('engaged', userIds[0], contentIds[2], 3.0, Date.now() - 5 * 60 * 1000);

        const related = getRelated('engaged', userIds[0], { count: 3, period: 10 * 60 * 1000, timeDecay: 0.5 });

        expect(related).toHaveLength(3);
        expect(related[0].id).toBe(contentIds[2]);
        expect(related[1].id).toBe(contentIds[0]);
        expect(related[2].id).toBe(contentIds[1]);
        expect(related[0].weight).toBeGreaterThan(2.1);
        expect(related[0].weight).toBeLessThan(2.5);
        expect(related[1].weight).toBeGreaterThan(1.98);
    });
});
