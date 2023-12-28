import { beforeEach, describe, it } from 'vitest';
import { resetGraph } from '../graph/state';
import { addNode } from '../graph/nodes';
import { addEdge } from '../graph/edges';
import { makeUserGraphSnapshot } from './users';

describe('Users makeUserGraphSnapshot()', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('captures relevant coengagement edges', async ({ expect }) => {
        addNode('content', 'content:1');
        addNode('content', 'content:2');
        addNode('content', 'content:3');
        addNode('user', 'user:1');
        addEdge('engaged', 'user:1', 'content:1', 0.5);
        addEdge('coengaged', 'content:1', 'content:2', 1);
        addEdge('coengaged', 'content:1', 'content:3', 0.5);
        addEdge('coengaged', 'content:2', 'content:3', 0.5);

        const results = makeUserGraphSnapshot('user:1', 5000);
        expect(results.edges).toHaveLength(2);
        expect(results.edges).toContainEqual({
            source: 'content:1',
            destination: 'content:2',
            weight: 1,
            type: 'coengaged',
        });
        expect(results.nodes).toHaveLength(0);
    });

    it('time limits coengagement edges', async ({ expect }) => {
        addNode('content', 'content:1');
        addNode('content', 'content:2');
        addNode('content', 'content:3');
        addNode('user', 'user:1');
        addEdge('engaged', 'user:1', 'content:1', 0.5);
        addEdge('coengaged', 'content:1', 'content:2', 1);
        addEdge('coengaged', 'content:1', 'content:3', 0.5, Date.now() - 8000);

        const results = makeUserGraphSnapshot('user:1', 5000);
        expect(results.edges).toHaveLength(1);
        expect(results.edges).toContainEqual({
            source: 'content:1',
            destination: 'content:2',
            weight: 1,
            type: 'coengaged',
        });
        expect(results.nodes).toHaveLength(0);
    });

    it('captures relevant similar user edges', async ({ expect }) => {
        addNode('user', 'user:1');
        addNode('user', 'user:2');
        addNode('user', 'user:3');
        addNode('user', 'user:4');
        addEdge('similar', 'user:1', 'user:2', 0.5);
        addEdge('similar', 'user:1', 'user:3', 0.5);
        addEdge('similar', 'user:2', 'user:4', 0.5);

        const results = makeUserGraphSnapshot('user:1', 5000);
        expect(results.edges).toHaveLength(2);
        expect(results.edges).toContainEqual({
            source: 'user:1',
            destination: 'user:2',
            weight: 0.5,
            type: 'similar',
        });
        expect(results.nodes).toHaveLength(3);
    });
});
