import { beforeEach, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TopicGraph from './TopicGraph';
import TestWrapper from '@genaism/util/TestWrapper';
import { addTopic, getGraphService, getProfilerService } from '@knicos/genai-recom';

describe('TopicGraph component', () => {
    beforeEach(() => {
        getGraphService().reset();
    });

    it('renders with no topics', async ({ expect }) => {
        render(<TopicGraph />, { wrapper: TestWrapper });
        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders with similarity links', async ({ expect }) => {
        const graph = getGraphService();
        const tid1 = addTopic(graph, 'test1');
        const tid2 = addTopic(graph, 'test2');
        const tid3 = addTopic(graph, 'test3');
        getProfilerService().createUserProfile('user:xyz', 'TestUser1');
        graph.addEdge('topic', tid1, 'user:xyz', 1);
        graph.addEdge('topic', tid2, 'user:xyz', 1);
        graph.addEdge('topic', tid3, 'user:xyz', 1);
        graph.addEdge('topic', 'user:xyz', tid1, 1);
        graph.addEdge('topic', 'user:xyz', tid2, 1);
        graph.addEdge('topic', 'user:xyz', tid3, 1);

        render(<TopicGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('test1')).toBeVisible());
        expect(screen.getByText('test2')).toBeVisible();
        expect(screen.getByText('test3')).toBeVisible();
    });

    it('does not render if no similarity', async ({ expect }) => {
        const graph = getGraphService();
        const tid1 = addTopic(graph, 'test1');
        addTopic(graph, 'test2');
        addTopic(graph, 'test3');
        getProfilerService().createUserProfile('user:xyz', 'TestUser1');
        graph.addEdge('topic', tid1, 'user:xyz', 1);
        graph.addEdge('topic', 'user:xyz', tid1, 1);

        render(<TopicGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('test1')).toBeVisible());
        expect(screen.queryByText('test2')).not.toBeInTheDocument();
        expect(screen.queryByText('test3')).not.toBeInTheDocument();
    });
});
