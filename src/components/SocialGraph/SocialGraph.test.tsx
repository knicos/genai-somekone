import { addNode } from '@genaism/services/graph/nodes';
import { resetGraph } from '@genaism/services/graph/state';
import { beforeEach, describe, it, vi } from 'vitest';
import SocialGraph from './SocialGraph';
import { render, screen, waitFor } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { appConfiguration, settingDisplayLabel } from '@genaism/state/settingsState';
import { Embedding } from '@genaism/util/embedding';

vi.mock('@genaism/services/content/mapping', () => ({
    mapEmbeddingsToPoints: (e: Embedding[]) => e.map(() => ({ x: 0, y: 0 })),
}));

describe('SocialGraph Component', () => {
    beforeEach(() => {
        resetGraph();
        addNode('user', 'user:test1', { name: 'TestUser1' });
        addNode('user', 'user:test2', { name: 'TestUser2' });
    });

    it('renders nodes', async ({ expect }) => {
        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        expect(nodes).toHaveLength(2);
        expect(screen.getByTestId('social-menu-images')).toBeVisible();
    });

    it('shows labels', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingDisplayLabel, true);
                }}
            >
                <SocialGraph />
            </TestWrapper>
        );

        await waitFor(() => expect(screen.getByText('TestUser1')).toBeVisible());
    });

    it('allows node selection', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-feed-button')).toBeVisible();
    });

    it('opens a feed view', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-feed-button')).toBeVisible();
        await user.click(screen.getByTestId('social-menu-feed-button'));
        expect(screen.getByTestId('feed-panel')).toBeVisible();
    });

    it('opens a data view', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-data-button')).toBeVisible();
        await user.click(screen.getByTestId('social-menu-data-button'));
        expect(screen.getByTestId('data-panel')).toBeVisible();
    });

    it('opens a profile view', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-profile-button')).toBeVisible();
        await user.click(screen.getByTestId('social-menu-profile-button'));
        expect(screen.getByTestId('profile-panel')).toBeVisible();
    });

    it('opens a recommendations view', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({ ...p, showRecommendationWizard: true, experimental: true }));
                }}
            >
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle');
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-recom-button')).toBeVisible();
        await user.click(screen.getByTestId('social-menu-recom-button'));
        expect(screen.getByTestId('recom-panel')).toBeVisible();
    });
});
