import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
// import userEvent from '@testing-library/user-event';
import PersonalCandidates from './PersonalCandidates';
import { createStore } from 'jotai';

describe('PersonalCandidates component', () => {
    it('shows taste selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 0, taste: 1, similarUsers: 0, coengaged: 0, popular: 0 },
        });
        render(
            <TestWrapper initializeState={store}>
                <PersonalCandidates
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('taste-option')).toBeChecked();
    });

    it('shows coengaged selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 0, taste: 0, similarUsers: 0, coengaged: 1, popular: 0 },
        });
        render(
            <TestWrapper initializeState={store}>
                <PersonalCandidates
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('coengaged-option')).toBeChecked();
    });

    it('shows user selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 0, taste: 0, similarUsers: 1, coengaged: 0, popular: 0 },
        });
        render(
            <TestWrapper initializeState={store}>
                <PersonalCandidates
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('users-option')).toBeChecked();
    });
});
