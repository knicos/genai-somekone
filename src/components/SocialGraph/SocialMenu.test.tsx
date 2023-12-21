import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialMenu from './SocialMenu';
import TestWrapper from '@genaism/util/TestWrapper';
import { addNode } from '@genaism/services/graph/nodes';
import { resetGraph } from '@genaism/services/graph/state';
import userEvent from '@testing-library/user-event';
import { useRecoilValue } from 'recoil';
import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';

describe('SocialMenu component', () => {
    beforeEach(() => resetGraph());
    it('renders the default menu', async ({ expect }) => {
        render(
            <TestWrapper>
                <SocialMenu />
            </TestWrapper>
        );

        expect(screen.getByText('dashboard.titles.people')).toBeVisible();
    });

    it('renders a selected user menu', async ({ expect }) => {
        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuSelectedUser, 'user:test');
                }}
            >
                <SocialMenu />
            </TestWrapper>
        );

        expect(screen.getByText('FakeUsername')).toBeVisible();
    });

    it('can show a feed view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuSelectedUser);
            const panel = useRecoilValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuSelectedUser, 'user:test');
                }}
            >
                <Observer />
                <SocialMenu />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-feed-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'feed');
    });

    it('can show a data view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuSelectedUser);
            const panel = useRecoilValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuSelectedUser, 'user:test');
                }}
            >
                <Observer />
                <SocialMenu />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-data-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'data');
    });

    it('can show a profile view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuSelectedUser);
            const panel = useRecoilValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuSelectedUser, 'user:test');
                }}
            >
                <Observer />
                <SocialMenu />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-profile-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'profile');
    });

    it('can show a recommendations view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuSelectedUser);
            const panel = useRecoilValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(menuSelectedUser, 'user:test');
                }}
            >
                <Observer />
                <SocialMenu />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-recom-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'recommendations');
    });
});
