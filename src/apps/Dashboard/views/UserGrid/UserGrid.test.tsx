import { settingNodeMode } from '@genaism/apps/Dashboard/state/settingsState';
import { TestWrapper } from '@knicos/genai-base';
import { render, screen } from '@testing-library/react';
import { beforeEach, describe, it } from 'vitest';
import UserGrid from './UserGrid';
import { getContentService, getGraphService, getProfilerService } from '@knicos/genai-recom';
import userEvent from '@testing-library/user-event';

describe('UserGrid component', () => {
    beforeEach(() => {
        getContentService().reset();
        getProfilerService().reset();
        getGraphService().reset();
    });

    it('renders with no users', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingNodeMode, 'profileImage');
                }}
            >
                <UserGrid />
            </TestWrapper>
        );

        expect(screen.getByText('dashboard.messages.waitingPeople')).toBeVisible();
    });

    it('shows one user', async ({ expect }) => {
        const profiler = getProfilerService();
        profiler.createUserProfile('user:1', 'TestUser1');

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingNodeMode, 'profileImage');
                }}
            >
                <UserGrid />
            </TestWrapper>
        );

        expect(screen.getByTestId('user-grid-item-user:1')).toBeVisible();
    });

    it('shows two users', async ({ expect }) => {
        const profiler = getProfilerService();
        profiler.createUserProfile('user:1', 'TestUser1');
        profiler.createUserProfile('user:2', 'TestUser2');

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingNodeMode, 'profileImage');
                }}
            >
                <UserGrid />
            </TestWrapper>
        );

        expect(screen.getByTestId('user-grid-item-user:1')).toBeVisible();
        expect(screen.getByTestId('user-grid-item-user:2')).toBeVisible();
        expect(await screen.findByText('TestUser2')).toBeInTheDocument();
    });

    it('can switch to image cloud', async ({ expect }) => {
        const user = userEvent.setup();
        const profiler = getProfilerService();
        const profile = profiler.createUserProfile('user:1', 'TestUser1');
        const content = getContentService();
        content.addContent('x', { id: '1', labels: [] });
        profile.affinities.contents.contents = [{ id: 'content:1', weight: 1 }];

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingNodeMode, 'profileImage');
                }}
            >
                <UserGrid />
            </TestWrapper>
        );

        const imageButton = screen.getByTestId('social-menu-images');
        expect(imageButton).toBeVisible();
        await user.click(imageButton);
        expect(await screen.findByTestId('imagecloud-user:1')).toBeVisible();
    });
});
