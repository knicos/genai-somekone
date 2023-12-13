import { beforeEach, describe, it } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import TopicGraph from './TopicGraph';
import { resetGraph } from '@genaism/services/graph/state';
import { addTopic } from '@genaism/services/concept/concept';
import TestWrapper from '@genaism/util/TestWrapper';
import { createUserProfile } from '@genaism/services/profiler/profiler';
import { addEdge } from '@genaism/services/graph/edges';

describe('TopicGraph component', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('renders with no topics', async ({ expect }) => {
        render(<TopicGraph />, { wrapper: TestWrapper });
        expect(screen.getByTestId('graph-svg')).toBeVisible();
    });

    it('renders with similarity links', async ({ expect }) => {
        const tid1 = addTopic('test1', 1);
        const tid2 = addTopic('test2', 1);
        const tid3 = addTopic('test3', 1);
        createUserProfile('user:xyz', 'TestUser1');
        addEdge('topic', tid1, 'user:xyz', 1);
        addEdge('topic', tid2, 'user:xyz', 1);
        addEdge('topic', tid3, 'user:xyz', 1);
        addEdge('topic', 'user:xyz', tid1, 1);
        addEdge('topic', 'user:xyz', tid2, 1);
        addEdge('topic', 'user:xyz', tid3, 1);

        render(<TopicGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('test1')).toBeVisible());
        expect(screen.getByText('test2')).toBeVisible();
        expect(screen.getByText('test3')).toBeVisible();
    });

    it('does not render if no similarity', async ({ expect }) => {
        const tid1 = addTopic('test1', 1);
        addTopic('test2', 1);
        addTopic('test3', 1);
        createUserProfile('user:xyz', 'TestUser1');
        addEdge('topic', tid1, 'user:xyz', 1);
        addEdge('topic', 'user:xyz', tid1, 1);

        render(<TopicGraph />, { wrapper: TestWrapper });
        await waitFor(() => expect(screen.getByText('test1')).toBeVisible());
        expect(screen.queryByText('test2')).not.toBeInTheDocument();
        expect(screen.queryByText('test3')).not.toBeInTheDocument();
    });
});
