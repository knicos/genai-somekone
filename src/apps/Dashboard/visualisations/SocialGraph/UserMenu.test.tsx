import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import userEvent from '@testing-library/user-event';
import { createStore, useAtomValue } from 'jotai';
import { menuSelectedUser, menuShowUserPanel } from '@genaism/apps/Dashboard/state/menuState';
import { getGraphService } from '@genai-fi/recom';
import UserMenu from './UserMenu';

const store = createStore();
store.set(menuSelectedUser, 'user:test');

describe('UserMenu component', () => {
    beforeEach(() => getGraphService().reset());

    it('renders a selected user menu', async ({ expect }) => {
        getGraphService().addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper initializeState={store}>
                <UserMenu
                    x={0}
                    y={0}
                />
            </TestWrapper>
        );

        expect(screen.getByText('FakeUsername')).toBeVisible();
    });

    it('can show a feed view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useAtomValue(menuSelectedUser);
            const panel = useAtomValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        getGraphService().addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper initializeState={store}>
                <Observer />
                <UserMenu
                    x={0}
                    y={0}
                />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-feed-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'feed');
    });

    it('can show a data view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useAtomValue(menuSelectedUser);
            const panel = useAtomValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        getGraphService().addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper initializeState={store}>
                <Observer />
                <UserMenu
                    x={0}
                    y={0}
                />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-data-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'data');
    });

    it('can show a profile view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useAtomValue(menuSelectedUser);
            const panel = useAtomValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        getGraphService().addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper initializeState={store}>
                <Observer />
                <UserMenu
                    x={0}
                    y={0}
                />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-profile-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'profile');
    });

    it('can show a recommendations view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useAtomValue(menuSelectedUser);
            const panel = useAtomValue(menuShowUserPanel);
            if (user) observerFn(user, panel);
            return null;
        };

        getGraphService().addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper initializeState={store}>
                <Observer />
                <UserMenu
                    x={0}
                    y={0}
                />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-recom-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test', 'recommendations');
    });
});
