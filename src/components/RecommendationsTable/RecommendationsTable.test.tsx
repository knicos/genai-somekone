import { describe, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import RecommendationsTable from './RecommendationsTable';

describe('RecommendationsTable component', () => {
    it('renders with no recommendations', async ({ expect }) => {
        render(<RecommendationsTable recommendations={[]} />);

        expect(screen.getByTestId('log-table')).toBeInTheDocument();
        expect(screen.queryByTestId('log-row')).not.toBeInTheDocument();
    });

    it('shows a single random item', async ({ expect }) => {
        render(
            <RecommendationsTable
                recommendations={[
                    {
                        candidateOrigin: 'random',
                        score: 0.5,
                        tasteSimilarityScore: 0.1,
                        contentId: 'content:xyz',
                        contentTrendingScore: 0,
                        topicTrendingScore: 0,
                        userSimilarityScore: 0,
                        randomnessScore: 0,
                        seenFactor: 1,
                        coengagementScore: 0,
                        rank: 0,
                        timestamp: 0,
                    },
                ]}
            />
        );

        expect(screen.getByTestId('log-table')).toBeInTheDocument();
        expect(screen.getByTestId('log-row')).toBeInTheDocument();
        expect(screen.getByText(/recommendations.labels.random/)).toBeVisible();
    });

    it('shows multiple items', async ({ expect }) => {
        render(
            <RecommendationsTable
                recommendations={[
                    {
                        candidateOrigin: 'random',
                        score: 0.5,
                        tasteSimilarityScore: 0.1,
                        contentId: 'content:xyz',
                        contentTrendingScore: 0,
                        topicTrendingScore: 0,
                        userSimilarityScore: 0,
                        randomnessScore: 0,
                        seenFactor: 1,
                        coengagementScore: 0,
                        rank: 0,
                        timestamp: 0,
                    },
                    {
                        candidateOrigin: 'topic_affinity',
                        score: 0.5,
                        tasteSimilarityScore: 0.1,
                        contentId: 'content:xyz',
                        contentTrendingScore: 0,
                        topicTrendingScore: 0,
                        userSimilarityScore: 0,
                        randomnessScore: 0,
                        seenFactor: 1,
                        coengagementScore: 0,
                        rank: 0,
                        timestamp: 0,
                        topic: 'testtopic',
                    },
                    {
                        candidateOrigin: 'random',
                        score: 0.5,
                        tasteSimilarityScore: 0.1,
                        contentId: 'content:xyz',
                        contentTrendingScore: 0,
                        topicTrendingScore: 0,
                        userSimilarityScore: 0,
                        randomnessScore: 0,
                        seenFactor: 1,
                        coengagementScore: 0,
                        rank: 0,
                        timestamp: 0,
                    },
                ]}
            />
        );

        expect(screen.getByTestId('log-table')).toBeInTheDocument();
        expect(screen.getAllByTestId('log-row')).toHaveLength(3);
        expect(screen.getAllByText(/recommendations.labels.random/)).toHaveLength(2);
        expect(screen.getByText(/recommendations.labels.topicCandidate/)).toBeVisible();
    });
});
