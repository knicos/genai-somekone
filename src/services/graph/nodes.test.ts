import { describe, it, beforeEach } from 'vitest';
import { addNode, getNodeType, getNodesByType } from './nodes';
import { resetGraph } from './state';

describe('graph.addNode', () => {
    beforeEach(() => resetGraph());

    it('gives an id after adding', async ({ expect }) => {
        const id = addNode('content');
        expect(id).toBeTypeOf('string');
        expect(id.length).toBeGreaterThan(5);
    });

    it('uses the same id if provided', async ({ expect }) => {
        const id = addNode('content', 'mytestid');
        expect(id).toBe('mytestid');
    });

    it('throws if the id already exists', async ({ expect }) => {
        addNode('content', 'mytestid');
        expect(() => addNode('content', 'mytestid')).toThrowError('id_exists');
    });
});

describe('graph.getNodeType', () => {
    beforeEach(() => resetGraph());

    it('returns the correct type for a node', async ({ expect }) => {
        const id1 = addNode('content');
        const id2 = addNode('topic');

        expect(getNodeType(id1)).toBe('content');
        expect(getNodeType(id2)).toBe('topic');
    });

    it('returns null if the id does not exist', async ({ expect }) => {
        expect(getNodeType('somenodeid')).toBeNull();
    });
});

describe('graph.getNodesByType', () => {
    beforeEach(() => resetGraph());

    it('returns all nodes of a type only', async ({ expect }) => {
        const id1 = addNode('content');
        const id2 = addNode('content');
        const id3 = addNode('topic');

        const nodes = getNodesByType('content');

        expect(nodes).toHaveLength(2);
        expect(nodes).toContain(id1);
        expect(nodes).toContain(id2);
        expect(nodes).not.toContain(id3);
    });
});
