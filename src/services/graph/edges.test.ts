import { describe, it, beforeEach } from 'vitest';
import { addEdge, getEdgeWeights, getEdges, getEdgesOfType } from './edges';
import { edgeStore, resetGraph } from './state';
import { addNode } from './nodes';

describe('graph.addEdge', () => {
    beforeEach(() => resetGraph());

    it('updates the edges store', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id = addEdge('liked', id1, id2, 3.0);
        expect(id).toBeTypeOf('string');
        expect(id && edgeStore.has(id)).toBe(true);
    });

    it('fails if source node does not exist', async ({ expect }) => {
        const id2 = addNode('content');
        const id = addEdge('liked', 'user:fake', id2, 3.0);
        expect(id).toBe(null);
    });

    it('fails if destination node does not exist', async ({ expect }) => {
        const id2 = addNode('user');
        const id = addEdge('liked', id2, 'content:fake', 3.0);
        expect(id).toBe(null);
    });
});

describe('graph.getEdgeWeights', () => {
    it('returns a single weight for one edge', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('liked', id1, id3, 4.0);

        const w = getEdgeWeights('liked', id1, id2);
        expect(w).toHaveLength(1);
        expect(w[0]).toBe(3);
    });

    it('returns a multiple weights', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('liked', id1, id3, 4.0);

        const w = getEdgeWeights('liked', id1);
        expect(w).toHaveLength(2);
        expect(w).toContain(3);
        expect(w).toContain(4);
    });

    it('returns specified weights', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        const id4 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('liked', id1, id3, 4.0);
        addEdge('liked', id1, id4, 2.0);

        const w = getEdgeWeights('liked', id1, [id2, id3]);
        expect(w).toHaveLength(2);
        expect(w).toContain(3);
        expect(w).toContain(4);
    });
});

describe('graph.getEdges', () => {
    it('returns all edges for one node', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('engaged', id1, id3, 4.0);

        const edges = getEdges(id1);
        expect(edges).toHaveLength(2);
    });

    it('returns all edges for all nodes', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('engaged', id1, id3, 4.0);
        addEdge('comment', id2, id1, 4.0);

        const edges = getEdges([id1, id2]);
        expect(edges).toHaveLength(3);
    });

    it('returns no edges for nodes without edges', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('engaged', id1, id3, 4.0);

        const edges = getEdges(id3);
        expect(edges).toHaveLength(0);
    });
});

describe('graph.getEdgesOfType', () => {
    it('gives all edges of one type for one node', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('content');
        const id3 = addNode('content');
        const id4 = addNode('content');
        addEdge('liked', id1, id2, 3.0);
        addEdge('liked', id1, id4, 3.0);
        addEdge('engaged', id1, id3, 4.0);

        const edges = getEdgesOfType('liked', id1);
        expect(edges).toHaveLength(2);
        expect(edges[0].destination).toBe(id2);
        expect(edges[1].destination).toBe(id4);
    });

    it('gives all edges of one type for specified nodes', async ({ expect }) => {
        const id1 = addNode('user');
        const id2 = addNode('user');
        const id3 = addNode('content');
        const id4 = addNode('content');
        const id5 = addNode('user');
        addEdge('liked', id1, id3, 3.0);
        addEdge('comment', id1, id4, 3.0);
        addEdge('liked', id2, id3, 4.0);
        addEdge('liked', id5, id4, 4.0);

        const edges = getEdgesOfType('liked', [id1, id2]);
        expect(edges).toHaveLength(2);
    });

    it('gives the updated edge weight', async ({ expect }) => {
        const id1 = addNode('content');
        const id2 = addNode('user');
        addEdge('comment', id1, id2, 1.0);

        const edges = getEdgesOfType('comment', id1);
        expect(edges).toHaveLength(1);
        expect(edges[0].weight).toBe(1);

        addEdge('comment', id1, id2, 2.0);
        const edges2 = getEdgesOfType('comment', id1);
        expect(edges2).toHaveLength(1);
        expect(edges2[0].weight).toBe(2);
    });
});
