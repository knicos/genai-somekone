import { beforeEach, describe, it } from 'vitest';
import { resetGraph } from '../graph/state';
import { createUserProfile } from '../profiler/profiler';
import { addNode } from '../graph/nodes';
import { addEdge } from '../graph/edges';
import { addTopic, getTopicId } from '../concept/concept';
import { scoreCandidates } from './scoring';
import { Recommendation } from './recommenderTypes';

describe('Scoring.scoreCandidates()', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('calculates a taste score if no test available', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates: Recommendation[] = [
            {
                contentId: 'content:xyz',
                candidateOrigin: 'topic_affinity',
                timestamp: Date.now(),
            },
        ];
        const scored = scoreCandidates(candidates, profile, 10);
        expect(scored).toHaveLength(1);
        expect(scored[0].score).toBe(0);
    });

    it('calculates a taste score correctly', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        addTopic('topic1', 1);
        addTopic('topic2', 1);
        addNode('content', 'content:xyz2');
        addEdge('topic', 'content:xyz2', getTopicId('topic1'), 1.0);
        addEdge('topic', 'content:xyz2', getTopicId('topic2'), 0.5);
        profile.taste = [{ label: 'topic1', weight: 0.5 }];
        const candidates: Recommendation[] = [
            {
                contentId: 'content:xyz2',
                candidateOrigin: 'topic_affinity',
                timestamp: Date.now(),
            },
        ];
        const scored = scoreCandidates(candidates, profile, 10);
        expect(scored).toHaveLength(1);
        expect(scored[0].score).toBeGreaterThan(0.8);
    });
});
