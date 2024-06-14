import { beforeEach, describe, it } from 'vitest';
import { resetGraph } from '../graph/state';
import { createUserProfile } from '../profiler/profiler';
import { scoreCandidates } from './scoring';
import { Recommendation } from './recommenderTypes';
import { addContent } from '../content/content';

describe('Scoring.scoreCandidates()', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('calculates a taste score if no taste available', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates: Recommendation[] = [
            {
                contentId: 'content:xyz',
                candidateOrigin: 'topic_affinity',
                timestamp: Date.now(),
            },
        ];
        const scored = scoreCandidates('user:xyz', candidates, profile);
        expect(scored).toHaveLength(1);
        expect(scored[0].score).toBeLessThanOrEqual(0.15);
    });

    it('calculates a taste score correctly', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        addContent('xxx', { labels: [], id: 'xyz2', embedding: [0.9, 0.1] });
        profile.embeddings.taste = [0.8, 0.2];
        const candidates: Recommendation[] = [
            {
                contentId: 'content:xyz2',
                candidateOrigin: 'topic_affinity',
                timestamp: Date.now(),
            },
        ];
        const scored = scoreCandidates('user:xyz', candidates, profile);
        expect(scored).toHaveLength(1);
        expect(scored[0].score).toBeGreaterThan(0.0);
        expect(scored[0].features.taste).toBeGreaterThan(0.01);
    });
});
