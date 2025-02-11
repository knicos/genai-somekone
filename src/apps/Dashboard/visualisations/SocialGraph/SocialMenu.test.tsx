import { beforeEach, describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import SocialMenu from './SocialMenu';
import TestWrapper from '@genaism/util/TestWrapper';
import { getGraphService } from '@knicos/genai-recom';

describe('SocialMenu component', () => {
    beforeEach(() => getGraphService().reset());
    it('renders the default menu', async ({ expect }) => {
        render(
            <TestWrapper>
                <SocialMenu />
            </TestWrapper>
        );

        expect(screen.getByText('dashboard.titles.people')).toBeVisible();
    });
});
