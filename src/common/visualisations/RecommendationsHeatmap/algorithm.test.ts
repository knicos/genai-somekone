import { describe, it, vi } from 'vitest';
import { heatmapScores } from './algorithm';
import {
    ContentService,
    createEmptyProfile,
    GraphService,
    ProfilerService,
    Recommendation,
    RecommenderService,
    ScoredRecommendation,
    ServiceBroker,
} from '@knicos/genai-recom';

const { mockCandidates, mockScoring } = vi.hoisted(() => ({
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

vi.mock('@knicos/genai-recom', async () => {
    const mod = await vi.importActual<typeof import('@knicos/genai-recom')>('@knicos/genai-recom');
    return {
        ...mod,
        RecommenderService: vi.fn(() => ({
            getCandidateProbability: mockCandidates,
            getScoringProbabilities: mockScoring,
        })),
    };
});

vi.mock('@genaism/services/recommender/candidates', () => ({
    candidateProbabilities: mockCandidates,
}));

vi.mock('@genaism/services/recommender/scoring', () => ({
    scoringProbability: mockScoring,
}));

describe('heatmapScores()', () => {
    it('generates the expected results', async ({ expect }) => {
        const broker = new ServiceBroker();
        const graph = new GraphService(broker);
        const content = new ContentService(broker, graph);
        const profiler = new ProfilerService(broker, graph, content);
        const recommender = new RecommenderService(broker, graph, content, profiler);

        const scores = await heatmapScores(
            recommender,
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
