import { beforeEach, describe, it } from 'vitest';
import { resetGraph } from '../graph/state';
import { generateCandidates } from './candidates';
import { createUserProfile } from '../profiler/profiler';
import { addNode } from '../graph/nodes';
import { addEdge } from '../graph/edges';
import { addTopic } from '../concept/concept';

beforeEach(() => {
    resetGraph();
});

describe('Candidates.generateCandidates()', () => {
    it('returns no candidates if there is no data', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates = generateCandidates(profile, 10);
        expect(candidates).toHaveLength(0);
    });

    it('returns a random candidate if no other candidates', async ({ expect }) => {
        addNode('content', 'content:ggg');
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates = generateCandidates(profile, 10);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].candidateOrigin).toBe('random');
        expect(candidates[0].contentId).toBe('content:ggg');
    });

    it('generates taste candidates', async ({ expect }) => {
        addNode('content', 'content:ggg');
        const topicID = addTopic('topic1', 1.0);
        addEdge('content', topicID, 'content:ggg', 1.0);
        const profile = createUserProfile('user:xyz', 'TestUser');
        profile.taste = [{ label: 'topic1', weight: 0.5 }];
        const candidates = generateCandidates(profile, 10, { noRandom: true });

        expect(candidates).toHaveLength(1);
        expect(candidates[0].candidateOrigin).toBe('topic_affinity');
        expect(candidates[0].contentId).toBe('content:ggg');
        expect(candidates[0].topicAffinity).toBe(0.5);
    });
});
