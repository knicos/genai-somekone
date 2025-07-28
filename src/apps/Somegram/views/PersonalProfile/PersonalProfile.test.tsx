import { getContentService, getProfilerService } from '@genai-fi/recom';
import { render, screen } from '@testing-library/react';
import { describe, it } from 'vitest';
import PersonalProfile from './PersonalProfile';
import { MemoryRouter } from 'react-router-dom';
import TestWrapper from '@genaism/util/TestWrapper';

describe('PersonalProfile component', () => {
    it('shows an empty profile', async ({ expect }) => {
        const profiler = getProfilerService();
        profiler.reset();

        profiler.createUserProfile('user:xyz', 'NoName');

        render(
            <TestWrapper>
                <PersonalProfile id="user:xyz" />
            </TestWrapper>
        );

        expect(screen.getByText('NoName')).toBeVisible();
        expect(screen.getByTestId('noposts-box')).toBeVisible();
    });

    it('includes content', async ({ expect }) => {
        const content = getContentService();
        const profiler = getProfilerService();
        content.reset();
        profiler.reset();

        profiler.createUserProfile('user:xyz', 'NoName');

        content.postContent('data', { id: '1', labels: [], authorId: 'user:xyz' });

        render(
            <TestWrapper>
                <MemoryRouter>
                    <PersonalProfile id="user:xyz" />
                </MemoryRouter>
            </TestWrapper>
        );

        expect(screen.getByText('NoName')).toBeVisible();
        expect(screen.getByTestId('gridimage-0')).toBeVisible();
    });
});
