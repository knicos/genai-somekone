import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import { useNode, useNodeType, useRelatedNodes } from './hooks';
import { addNode } from './nodes';
import { emitNodeEvent } from './events';
import { resetGraph } from './state';
import { addEdge } from './edges';

function NodeComponent({ action }: { action: () => void }) {
    useNode('user:xyz');
    action();
    return null;
}

function NodeTypeComponent({ action }: { action: () => void }) {
    const nodes = useNodeType('user');
    action();
    return nodes.map((n) => <span>{n}</span>);
}

function RelatedComponent({ action }: { action: () => void }) {
    const nodes = useRelatedNodes('user:xyz', 'engaged');
    action();
    return nodes.map((n) => <span>{n.id}</span>);
}

beforeEach(() => resetGraph());

describe('Graph hooks.useNode', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'user:xyz');

        const action = vi.fn();

        render(<NodeComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => emitNodeEvent('user:xyz'));
        expect(action).toHaveBeenCalledTimes(2);
    });
});

describe('Graph hooks.useNodeType', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'user:xyz');

        const action = vi.fn();

        render(<NodeTypeComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => addNode('user', 'user:zws'));
        expect(action).toHaveBeenCalledTimes(2);
    });

    it('generates the correct node list', async ({ expect }) => {
        addNode('user', 'user:xyz');

        const action = vi.fn();

        render(<NodeTypeComponent action={action} />);
        expect(screen.getByText('user:xyz')).toBeInTheDocument();

        act(() => addNode('user', 'user:zws'));
        expect(screen.getByText('user:xyz')).toBeInTheDocument();
        expect(screen.getByText('user:zws')).toBeInTheDocument();
    });
});

describe('Graph hooks.useRelatedNodes', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('user', 'user:xyz');
        addNode('content', 'content:hhh');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => addEdge('engaged', 'user:xyz', 'content:hhh'));
        expect(action).toHaveBeenCalledTimes(2);
    });

    it('generates the correct node list', async ({ expect }) => {
        addNode('user', 'user:xyz');
        addNode('content', 'content:hhh');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        act(() => addEdge('engaged', 'user:xyz', 'content:hhh'));
        expect(screen.getByText('content:hhh')).toBeInTheDocument();
    });

    it('only triggers once with multiple sync updates', async ({ expect }) => {
        addNode('user', 'user:xyz');
        addNode('content', 'content:hhh');
        addNode('content', 'content:ggg');
        addNode('content', 'content:fff');

        const action = vi.fn();

        render(<RelatedComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => {
            addEdge('engaged', 'user:xyz', 'content:hhh');
            addEdge('engaged', 'user:xyz', 'content:ggg');
            addEdge('engaged', 'user:xyz', 'content:fff');
        });
        expect(action).toHaveBeenCalledTimes(2);
    });
});
