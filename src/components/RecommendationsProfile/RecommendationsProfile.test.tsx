import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import RecommendationsProfile from './RecommendationsProfile';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/state/settingsState';
import userEvent from '@testing-library/user-event';

interface RecReturn {
    more: () => void;
    recommendations: ScoredRecommendation[];
}

const { mockRecommendations } = vi.hoisted(() => ({
    mockRecommendations: vi.fn<unknown[], RecReturn>(() => ({ more: () => {}, recommendations: [] })),
}));

vi.mock('@genaism/services/recommender/hooks', () => ({
    useRecommendations: mockRecommendations,
}));

describe('RecommendationsProfile component', () => {
    it('works with no content', async ({ expect }) => {
        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({ ...p, showRecommendationWizard: true, experimental: true }));
                }}
            >
                <RecommendationsProfile />
            </TestWrapper>
        );
        expect(await screen.findByTestId('recom-image-grid')).toBeInTheDocument();
        expect(await screen.findByTestId('recom-wizard')).toBeInTheDocument();
    });

    it('works with a topic candidate', async ({ expect }) => {
        const user = userEvent.setup();

        const recommendations: ScoredRecommendation[] = [
            {
                candidateOrigin: 'topic_affinity',
                score: 0.5,
                contentId: 'content:xyz',
                scores: {},
                significance: {},
                features: {},
                rank: 0,
                rankScore: 0,
                timestamp: 0,
                topic: 'testtopic',
            },
        ];
        mockRecommendations.mockImplementation(() => ({ more: () => {}, recommendations }));
        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({ ...p, showRecommendationWizard: true, experimental: true }));
                }}
            >
                <RecommendationsProfile />
            </TestWrapper>
        );

        expect(await screen.findByTestId('recom-image-grid')).toBeInTheDocument();
        await user.click(screen.getByLabelText('recommendations.aria.imageSelect'));
        expect(screen.getByText(/recommendations.labels.topicCandidate/)).toBeInTheDocument();
    });

    it('can open the wizard', async ({ expect }) => {
        const user = userEvent.setup();

        render(
            <TestWrapper
                initializeState={(snap) => {
                    snap.set(appConfiguration, (p) => ({
                        ...p,
                        showRecommendationWizard: true,
                        experimental: true,
                        recommendations: { random: 1, taste: 1, similarUsers: 1, coengaged: 1 },
                    }));
                }}
            >
                <RecommendationsProfile />
            </TestWrapper>
        );

        const start = await screen.findByTestId('start-recom-wizard');
        expect(start).toBeInTheDocument();
        user.click(start);
        expect(await screen.findByTestId('recom-candidate-options')).toBeVisible();
    });
});
