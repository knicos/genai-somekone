import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
// import userEvent from '@testing-library/user-event';
import CandidateOptions from './CandidateOptions';
import { createStore } from 'jotai';

describe('CandidateOptions component', () => {
    it('shows personal selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 0, taste: 1, similarUsers: 1, coengaged: 1, popular: 0 },
        });
        render(
            <TestWrapper initializeState={store}>
                <CandidateOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('personal-option')).toBeChecked();
    });

    it('shows non-personal selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 1, taste: 0, similarUsers: 0, coengaged: 0, popular: 1 },
        });
        render(
            <TestWrapper initializeState={store}>
                <CandidateOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('nonpersonal-option')).toBeChecked();
    });
});
