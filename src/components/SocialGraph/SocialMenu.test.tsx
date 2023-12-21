import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialMenu from './SocialMenu';
import TestWrapper from '@genaism/util/TestWrapper';
import { addNode } from '@genaism/services/graph/nodes';

describe('SocialMenu component', () => {
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
});
