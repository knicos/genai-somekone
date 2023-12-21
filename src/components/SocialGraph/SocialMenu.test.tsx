import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialMenu from './SocialMenu';
import TestWrapper from '@genaism/util/TestWrapper';
import { addNode } from '@genaism/services/graph/nodes';
import { resetGraph } from '@genaism/services/graph/state';
import userEvent from '@testing-library/user-event';
import { useRecoilValue } from 'recoil';
import { menuShowFeed, menuShowUserData, menuShowUserProfile } from '@genaism/state/menuState';

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
            <TestWrapper>
                <SocialMenu selectedUser="user:test" />
            </TestWrapper>
        );

        expect(screen.getByText('FakeUsername')).toBeVisible();
    });

    it('can show a feed view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuShowFeed);
            if (user) observerFn(user);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper>
                <Observer />
                <SocialMenu selectedUser="user:test" />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-feed-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test');
    });

    it('can show a data view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuShowUserData);
            if (user) observerFn(user);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper>
                <Observer />
                <SocialMenu selectedUser="user:test" />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-data-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test');
    });

    it('can show a profile view', async ({ expect }) => {
        const user = userEvent.setup();
        const observerFn = vi.fn();

        const Observer = function () {
            const user = useRecoilValue(menuShowUserProfile);
            if (user) observerFn(user);
            return null;
        };

        addNode('user', 'user:test', { name: 'FakeUsername' });
        render(
            <TestWrapper>
                <Observer />
                <SocialMenu selectedUser="user:test" />
            </TestWrapper>
        );

        await user.click(screen.getByTestId('social-menu-profile-button'));
        expect(observerFn).toHaveBeenCalledWith('user:test');
    });
});
