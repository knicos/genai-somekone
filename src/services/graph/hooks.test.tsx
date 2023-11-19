import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import { useNode, useNodeType, useRelatedNodes } from './hooks';
import { addNode } from './nodes';
import { emitNodeEvent } from './events';
import { resetGraph } from './state';
import { addEdge } from './edges';

function NodeComponent({ action }: { action: () => void }) {
    useNode('xyz');
    action();
    return null;
}

function NodeTypeComponent({ action }: { action: () => void }) {
    const nodes = useNodeType('user');
    action();
    return nodes.map((n) => <span>{n}</span>);
}

function RelatedComponent({ action }: { action: () => void }) {
    const nodes = useRelatedNodes('xyz', 'engaged');
    action();
    return nodes.map((n) => <span>{n.id}</span>);
}

beforeEach(() => resetGraph());

describe('Graph hooks.useNode', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'xyz');

        const action = vi.fn();

        render(<NodeComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => emitNodeEvent('xyz'));
        expect(action).toHaveBeenCalledTimes(2);
    });
});

describe('Graph hooks.useNodeType', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'xyz');

        const action = vi.fn();

        render(<NodeTypeComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => addNode('user', 'zws'));
        expect(action).toHaveBeenCalledTimes(2);
    });

    it('generates the correct node list', async ({ expect }) => {
        addNode('user', 'xyz');

        const action = vi.fn();

        render(<NodeTypeComponent action={action} />);
        expect(screen.getByText('xyz')).toBeInTheDocument();

        act(() => addNode('user', 'zws'));
        expect(screen.getByText('xyz')).toBeInTheDocument();
        expect(screen.getByText('zws')).toBeInTheDocument();
    });
});

describe('Graph hooks.useRelatedNodes', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'xyz');
        addNode('content', 'hhh');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => addEdge('engaged', 'xyz', 'hhh'));
        expect(action).toHaveBeenCalledTimes(2);
    });

    it('generates the correct node list', async ({ expect }) => {
        addNode('user', 'xyz');
        addNode('content', 'hhh');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        act(() => addEdge('engaged', 'xyz', 'hhh'));
        expect(screen.getByText('hhh')).toBeInTheDocument();
    });

    it('only triggers once with multiple sync updates', async ({ expect }) => {
        addNode('user', 'xyz');
        addNode('content', 'hhh');
        addNode('content', 'ggg');
        addNode('content', 'fff');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => {
            addEdge('engaged', 'xyz', 'hhh');
            addEdge('engaged', 'xyz', 'ggg');
            addEdge('engaged', 'xyz', 'fff');
        });
        expect(action).toHaveBeenCalledTimes(2);
    });
});
