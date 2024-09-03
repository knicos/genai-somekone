import { beforeEach, describe, it } from 'vitest';
import SocialGraph from './SocialGraph';
import { render, screen, waitFor } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { appConfiguration, settingDisplayLabel } from '@genaism/state/settingsState';
import { getGraphService } from '@knicos/genai-recom';

describe('SocialGraph Component', () => {
    beforeEach(() => {
        const graph = getGraphService();
        graph.reset();
        graph.addNode('user', 'user:test1', { name: 'TestUser1' });
        graph.addNode('user', 'user:test2', { name: 'TestUser2' });
    });

    it('renders nodes', async ({ expect }) => {
        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
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

        await waitFor(() => expect(screen.getByText(/TestUser1/)).toBeVisible(), { timeout: 4000 });
    });

    it('allows node selection', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper>
                <SocialGraph />
            </TestWrapper>
        );

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
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

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
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

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
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

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
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

        const nodes = await screen.findAllByTestId('profile-circle', undefined, { timeout: 4000 });
        await user.click(nodes[0]);
        expect(screen.getByTestId('social-menu-recom-button')).toBeVisible();
        await user.click(screen.getByTestId('social-menu-recom-button'));
        expect(screen.getByTestId('recom-panel')).toBeVisible();
    });
});
