import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/state/settingsState';
// import userEvent from '@testing-library/user-event';
import CandidateOptions from './CandidateOptions';

describe('CandidateOptions component', () => {
    it('shows personal selection correctly', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({
                        ...p,
                        showRecommendationWizard: true,
                        experimental: true,
                        recommendations: { random: 0, taste: 1, similarUsers: 1, coengaged: 1 },
                    }));
                }}
            >
                <CandidateOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('personal-option')).toBeChecked();
    });

    it('shows non-personal selection correctly', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({
                        ...p,
                        showRecommendationWizard: true,
                        experimental: true,
                        recommendations: { random: 1, taste: 0, similarUsers: 0, coengaged: 0 },
                    }));
                }}
            >
                <CandidateOptions
                    id="user:x"
                    changePage={() => {}}
                />
            </TestWrapper>
        );

        expect(await screen.findByTestId('nonpersonal-option')).toBeChecked();
    });
});
