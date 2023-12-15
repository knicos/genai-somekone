import { beforeEach, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ContentGraph from './ContentGraph';
import { resetGraph } from '@genaism/services/graph/state';
import TestWrapper from '@genaism/util/TestWrapper';
import { addEdge } from '@genaism/services/graph/edges';
import { addNode } from '@genaism/services/graph/nodes';

describe('ContentGraph component', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('renders with no content', async ({ expect }) => {
        render(<ContentGraph />, { wrapper: TestWrapper });
        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders with similarity links', async ({ expect }) => {
        const tid1 = addNode('content');
        const tid2 = addNode('content');
        const tid3 = addNode('content');
        addEdge('coengaged', tid1, tid2, 1);
        addEdge('coengaged', tid2, tid1, 1);
        addEdge('coengaged', tid3, tid1, 0.5);
        addEdge('coengaged', tid1, tid3, 0.5);

        render(<ContentGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByTestId(`topic-node-${tid1}`)).toBeVisible());
        expect(screen.getByTestId(`topic-node-${tid2}`)).toBeVisible();
        expect(screen.getByTestId(`topic-node-${tid3}`)).toBeVisible();
    });

    it('does not render if no similarity', async ({ expect }) => {
        const tid1 = addNode('content');
        const tid2 = addNode('content');
        const tid3 = addNode('content');
        addEdge('coengaged', tid1, tid2, 1);
        addEdge('coengaged', tid2, tid1, 1);

        render(<ContentGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByTestId(`topic-node-${tid1}`)).toBeVisible());
        expect(screen.queryByTestId(`topic-node-${tid3}`)).not.toBeInTheDocument();
    });
});
