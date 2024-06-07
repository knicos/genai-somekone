import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationsTable from './RecommendationsTable';

describe('RecommendationsTable component', () => {
    it('shows a single random item', async ({ expect }) => {
        render(
            <RecommendationsTable
                recommendation={{
                    candidateOrigin: 'random',
                    score: 0.5,
                    contentId: 'content:xyz',
                    scores: [],
                    features: [],
                    rank: 0,
                    rankScore: 0,
                    timestamp: 0,
                }}
            />
        );

        expect(screen.getByTestId('candidate-item')).toBeInTheDocument();
        expect(screen.getByTestId('score-item')).toBeInTheDocument();
        expect(screen.getByText(/recommendations.labels.random/)).toBeVisible();
    });

    it('shows taste score', async ({ expect }) => {
        render(
            <RecommendationsTable
                recommendation={{
                    candidateOrigin: 'random',
                    score: 0.5,
                    contentId: 'content:xyz',
                    scores: [1],
                    significance: [1],
                    features: [],
                    rank: 0,
                    rankScore: 0,
                    timestamp: 0,
                }}
            />
        );

        expect(screen.getByTestId('candidate-item')).toBeInTheDocument();
        expect(screen.getByTestId('score-item')).toBeInTheDocument();
        expect(screen.getByText(/recommendations.features.tasteSimilarity/)).toBeVisible();
    });
});
