import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import Graph from './Graph';
import TestWrapper from '@genaism/util/TestWrapper';

describe('Graph component', () => {
    it('renders with no nodes', async ({ expect }) => {
        render(<Graph nodes={[]} />, { wrapper: TestWrapper });

        expect(screen.getByTestId('graph-svg')).toBeInTheDocument();
    });

    it('renders with one node', async ({ expect }) => {
        render(
            <Graph nodes={[{ id: 'user:xyz', size: 50 }]}>
                <text data-testid="graph-node-1">Hello</text>
            </Graph>,
            {
                wrapper: TestWrapper,
            }
        );

        expect(screen.getByTestId('graph-node-1')).toBeInTheDocument();
    });

    it('renders with several nodes', async ({ expect }) => {
        render(
            <Graph
                nodes={[
                    { id: 'user:xyz', size: 50 },
                    { id: 'user:xyz2', size: 60 },
                    { id: 'user:xyz3', size: 70 },
                ]}
            >
                <text data-testid="graph-node-1">Hello</text>
                <text data-testid="graph-node-2">Hello2</text>
                <text data-testid="graph-node-3">Hello3</text>
            </Graph>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('graph-node-1')).toBeInTheDocument();
        expect(screen.getByTestId('graph-node-2')).toBeInTheDocument();
        expect(screen.getByTestId('graph-node-3')).toBeInTheDocument();
    });

    it('renders the link lines', async ({ expect }) => {
        render(
            <Graph
                nodes={[
                    { id: 'user:xyz', size: 50 },
                    { id: 'user:xyz2', size: 60 },
                    { id: 'user:xyz3', size: 70 },
                ]}
                links={[{ source: 'user:xyz', target: 'user:xyz2', strength: 1, actualStrength: 1 }]}
            >
                <text data-testid="graph-node-1">Hello</text>
                <text data-testid="graph-node-2">Hello2</text>
                <text data-testid="graph-node-3">Hello3</text>
            </Graph>,
            { wrapper: TestWrapper }
        );

        expect(screen.getByTestId('graph-link-0')).toBeInTheDocument();
    });

    it('ignores missing links', async ({ expect }) => {
        render(
            <Graph
                nodes={[
                    { id: 'user:xyz', size: 50 },
                    { id: 'user:xyz2', size: 60 },
                    { id: 'user:xyz3', size: 70 },
                ]}
                links={[{ source: 'user:xyz', target: 'user:xyz1', strength: 1, actualStrength: 1 }]}
            >
                <text data-testid="graph-node-1">Hello</text>
                <text data-testid="graph-node-2">Hello2</text>
                <text data-testid="graph-node-3">Hello3</text>
            </Graph>,
            { wrapper: TestWrapper }
        );

        expect(screen.queryByTestId('graph-link-0')).not.toBeInTheDocument();
    });
});
