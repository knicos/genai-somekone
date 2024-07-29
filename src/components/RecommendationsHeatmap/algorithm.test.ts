import { describe, it, vi } from 'vitest';
import { heatmapScores } from './algorithm';
import { createEmptyProfile } from '@genaism/services/profiler/profiler';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { Recommendation, ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';

const { mockCandidates, mockProfile, mockScoring } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserNodeData>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser1'),
    })),
    mockCandidates: vi.fn(() => 0.5),
    mockScoring: vi.fn((_, candidates: Recommendation[]): ScoredRecommendation[] => {
        return candidates.map((c) => ({
            ...c,
            features: {},
            scores: {},
            score: 1,
            significance: {},
            rank: 0,
            probability: c.candidateProbability,
            diversity: 0,
        }));
    }),
}));

vi.mock('@genaism/services/recommender/candidates', () => ({
    candidateProbabilities: mockCandidates,
}));

vi.mock('@genaism/services/recommender/scoring', () => ({
    scoringProbability: mockScoring,
}));

vi.mock('@genaism/services/users/users', () => ({
    getUserData: mockProfile,
}));

describe('heatmapScores()', () => {
    it('generates the expected results', async ({ expect }) => {
        const scores = await heatmapScores(
            ['content:1', 'content:2'],
            'user:1',
            createEmptyProfile('user:1', 'NoName'),
            {
                recommendations: {
                    taste: 2,
                    coengaged: 2,
                    random: 2,
                    popular: 2,
                    similarUsers: 2,
                },
            }
        );

        expect(scores).toHaveLength(2);
        expect(mockScoring).toHaveBeenCalledOnce();
        expect(mockCandidates).toHaveBeenCalledTimes(2);
        expect(scores[0].weight).toBe(0.5);
    });
});
