import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
import ScoringOptions from './ScoringOptions';
import { createStore } from 'jotai';

describe('ScoringOptions component', () => {
    it('shows engagement selection correctly', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, {
            showRecommendationWizard: true,
            experimental: true,
            recommendations: { random: 0, taste: 1, similarUsers: 1, coengaged: 1, popular: 1, noPopularity: true },
        });
        render(
            <TestWrapper initializeState={store}>
                <ScoringOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('profile-option')).toBeChecked();
    });
});
