import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationsProfile from './RecommendationsProfile';
import TestWrapper from '@genaism/util/TestWrapper';
import { appConfiguration } from '@genaism/common/state/configState';
import userEvent from '@testing-library/user-event';
import { getContentService, ScoredRecommendation } from '@knicos/genai-recom';
import { createStore } from 'jotai';

interface RecReturn {
    more: () => void;
    recommendations: ScoredRecommendation[];
}

const { mockRecommendations } = vi.hoisted(() => ({
    mockRecommendations: vi.fn<(a: unknown[]) => RecReturn>(() => ({ more: () => {}, recommendations: [] })),
}));

vi.mock('@genaism/hooks/recommender', () => ({
    useRecommendations: mockRecommendations,
}));

describe('RecommendationsProfile component', () => {
    it('works with no content', async ({ expect }) => {
        const store = createStore();
        store.set(appConfiguration, (p) => ({ ...p, showRecommendationWizard: true, experimental: true }));
        render(
            <TestWrapper initializeState={store}>
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
                diversity: 0,
                timestamp: 0,
                topic: 'testtopic',
            },
        ];
        mockRecommendations.mockImplementation(() => ({ more: () => {}, recommendations }));

        const store = createStore();
        store.set(appConfiguration, (p) => ({ ...p, showRecommendationWizard: true, experimental: true }));

        render(
            <TestWrapper initializeState={store}>
                <RecommendationsProfile />
            </TestWrapper>
        );

        expect(await screen.findByTestId('recom-image-grid')).toBeInTheDocument();
        await user.click(screen.getByLabelText('recommendations.aria.imageSelect'));
        expect(screen.getByText(/recommendations.labels.topicCandidate/)).toBeInTheDocument();
    });

    it('can open the wizard', async ({ expect }) => {
        const user = userEvent.setup();

        const store = createStore();
        store.set(appConfiguration, (p) => ({
            ...p,
            showRecommendationWizard: true,
            experimental: true,
            showCandidateWizard: true,
            recommendations: { random: 1, taste: 1, similarUsers: 1, coengaged: 1, popular: 1 },
        }));

        render(
            <TestWrapper initializeState={store}>
                <RecommendationsProfile />
            </TestWrapper>
        );

        const start = await screen.findByTestId('start-recom-wizard');
        expect(start).toBeInTheDocument();
        user.click(start);
        expect(await screen.findByTestId('recom-candidate-options')).toBeVisible();
    });

    it('can show the heatmap', async ({ expect }) => {
        const contentSvc = getContentService();
        contentSvc.addContent('', {
            id: '1',
            labels: [],
        });
        contentSvc.addContent('', {
            id: '2',
            labels: [],
        });
        const user = userEvent.setup();

        const store = createStore();
        store.set(appConfiguration, (p) => ({
            ...p,
            experimental: true,
            recommendations: { random: 1, taste: 1, similarUsers: 1, coengaged: 1, popular: 1 },
        }));

        render(
            <TestWrapper initializeState={store}>
                <RecommendationsProfile />
            </TestWrapper>
        );

        const heatmap = await screen.findByTestId('heatmap-button');
        expect(heatmap).toBeInTheDocument();
        user.click(heatmap);
        expect(await screen.findAllByTestId('heatmap-image')).toHaveLength(2);
    });
});
