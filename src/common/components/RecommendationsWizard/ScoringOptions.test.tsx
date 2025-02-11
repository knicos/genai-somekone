import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
import ScoringOptions from './ScoringOptions';

describe('ScoringOptions component', () => {
    it('shows engagement selection correctly', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({
                        ...p,
                        showRecommendationWizard: true,
                        experimental: true,
                        recommendations: {
                            random: 0,
                            taste: 1,
                            similarUsers: 1,
                            coengaged: 1,
                            popular: 1,
                            noPopularity: true,
                        },
                    }));
                }}
            >
                <ScoringOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('profile-option')).toBeChecked();
    });
});
