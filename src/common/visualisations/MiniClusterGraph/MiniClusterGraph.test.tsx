import TestWrapper from '@genaism/util/TestWrapper';
import { describe, it, vi } from 'vitest';
import MiniClusterGraph from './MiniClusterGraph';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { createEmptyProfile, getGraphService, getProfilerService, normalise, UserNodeData } from '@genai-fi/recom';

describe('MiniClusterGraph Component', () => {
    it('should render correctly', async ({ expect }) => {
        const graphSvc = getGraphService();
        graphSvc.reset();
        const testProfile: UserNodeData = {
            ...createEmptyProfile('user:1', 'Test User'),
            embeddings: {
                type: 'taste',
                taste: [0, 0, 0],
            },
        };
        graphSvc.addNode('user', 'user:1', { ...testProfile, name: 'User 1', id: 'user:1' });
        graphSvc.addNode('user', 'user:2', { ...testProfile, name: 'User 2', id: 'user:2' });
        graphSvc.addNode('user', 'user:3', { ...testProfile, name: 'User 3', id: 'user:3' });
        render(
            <TestWrapper>
                <MiniClusterGraph userId="user:1" />
            </TestWrapper>
        );

        await vi.waitFor(() => expect(screen.getByTestId('user:1')).toBeVisible());
    });

    it('should show user names on hover', async ({ expect }) => {
        const user = userEvent.setup();
        const graphSvc = getGraphService();
        graphSvc.reset();

        const profiler = getProfilerService();
        profiler.reset();
        profiler.createUserProfile('user:1', 'User 1').embeddings = {
            taste: normalise([1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            type: 'taste',
        };
        profiler.createUserProfile('user:2', 'User 2').embeddings = {
            taste: normalise([1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            type: 'taste',
        };
        profiler.createUserProfile('user:3', 'User 3').embeddings = {
            taste: normalise([1, 0.1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]),
            type: 'taste',
        };

        profiler.indexUser('user:1');
        profiler.indexUser('user:2');
        profiler.indexUser('user:3');

        render(
            <TestWrapper>
                <MiniClusterGraph userId="user:1" />
            </TestWrapper>
        );

        await vi.waitFor(() => expect(screen.getByTestId('user:1')).toBeVisible());
        await vi.waitFor(() => expect(screen.getByTestId('user:2')).toBeVisible());

        await user.click(screen.getByTestId('user:2'));

        expect(screen.getByText('User 2')).toBeVisible();
    });
});
