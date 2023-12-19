import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import RecommendationsProfile from './RecommendationsProfile';
import TestWrapper from '@genaism/util/TestWrapper';

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
        render(<RecommendationsProfile />, { wrapper: TestWrapper });
        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
    });

    it('works with a topic candidate', async ({ expect }) => {
        const recommendations: ScoredRecommendation[] = [
            {
                candidateOrigin: 'topic_affinity',
                score: 0.5,
                contentId: 'content:xyz',
                scores: [],
                features: [],
                rank: 0,
                timestamp: 0,
                topic: 'testtopic',
            },
        ];
        mockRecommendations.mockImplementation(() => ({ more: () => {}, recommendations }));
        render(<RecommendationsProfile />, { wrapper: TestWrapper });

        expect(await screen.findByTestId('cloud-image')).toBeInTheDocument();
        expect(screen.getByText(/recommendations.labels.topicCandidate/)).toBeInTheDocument();
    });
});
