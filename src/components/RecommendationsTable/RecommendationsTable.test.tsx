import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationsTable from './RecommendationsTable';

describe('RecommendationsTable component', () => {
    it('shows a single random item', async ({ expect }) => {
        render(
            <RecommendationsTable
                userId="user:xyz"
                recommendation={{
                    candidateOrigin: 'random',
                    score: 0.5,
                    contentId: 'content:xyz',
                    scores: {},
                    significance: {},
                    features: {},
                    rank: 0,
                    diversity: 0,
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
                userId="user:xyz"
                recommendation={{
                    candidateOrigin: 'random',
                    score: 0.5,
                    contentId: 'content:xyz',
                    scores: { taste: 1 },
                    significance: { taste: 1 },
                    features: {},
                    rank: 0,
                    diversity: 0,
                    timestamp: 0,
                }}
            />
        );

        expect(screen.getByTestId('candidate-item')).toBeInTheDocument();
        expect(screen.getByTestId('score-item')).toBeInTheDocument();
        expect(screen.getByText(/recommendations.features.taste/)).toBeVisible();
    });
});
