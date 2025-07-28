import { beforeEach, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import ContentGraph from './ContentGraph';
import TestWrapper from '@genaism/util/TestWrapper';
import { getGraphService } from '@genai-fi/recom';

describe('ContentGraph component', () => {
    beforeEach(() => {
        getGraphService().reset();
    });

    it('renders with no content', async ({ expect }) => {
        render(<ContentGraph />, { wrapper: TestWrapper });
        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders with similarity links', async ({ expect }) => {
        const graph = getGraphService();
        const tid1 = graph.addNode('content');
        const tid2 = graph.addNode('content');
        const tid3 = graph.addNode('content');
        graph.addEdge('coengaged', tid1, tid2, 1);
        graph.addEdge('coengaged', tid2, tid1, 1);
        graph.addEdge('coengaged', tid3, tid1, 0.5);
        graph.addEdge('coengaged', tid1, tid3, 0.5);

        render(<ContentGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByTestId(`topic-node-${tid1}`)).toBeVisible());
        expect(screen.getByTestId(`topic-node-${tid2}`)).toBeVisible();
        expect(screen.getByTestId(`topic-node-${tid3}`)).toBeVisible();
    });

    it('does not render if no similarity', async ({ expect }) => {
        const graph = getGraphService();
        const tid1 = graph.addNode('content');
        const tid2 = graph.addNode('content');
        const tid3 = graph.addNode('content');
        graph.addEdge('coengaged', tid1, tid2, 1);
        graph.addEdge('coengaged', tid2, tid1, 1);

        render(<ContentGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByTestId(`topic-node-${tid1}`)).toBeVisible());
        expect(screen.queryByTestId(`topic-node-${tid3}`)).not.toBeInTheDocument();
    });
});
