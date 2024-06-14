import { beforeEach, describe, it } from 'vitest';
import { resetGraph } from '../graph/state';
import { generateCandidates } from './candidates';
import { createUserProfile, touchProfile } from '../profiler/profiler';
import { addNode } from '../graph/nodes';
import { addEdge } from '../graph/edges';
import { addTopic } from '../concept/concept';
import { CandidateOptions } from './recommenderTypes';
import { normalise } from '@genaism/util/embedding';

beforeEach(() => {
    resetGraph();
});

const DEFAULT_OPTIONS: CandidateOptions = {
    random: 2,
    taste: 2,
    coengaged: 2,
    similarUsers: 2,
};

describe('Candidates.generateCandidates()', () => {
    it('returns no candidates if there is no data', async ({ expect }) => {
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates = generateCandidates(profile, 10, DEFAULT_OPTIONS);
        expect(candidates).toHaveLength(0);
    });

    it('returns a random candidate if no other candidates', async ({ expect }) => {
        addNode('content', 'content:ggg');
        const profile = createUserProfile('user:xyz', 'TestUser');
        const candidates = generateCandidates(profile, 10, DEFAULT_OPTIONS);
        expect(candidates).toHaveLength(1);
        expect(candidates[0].candidateOrigin).toBe('random');
        expect(candidates[0].contentId).toBe('content:ggg');
    });

    it('generates taste candidates', async ({ expect }) => {
        addNode('content', 'content:ggg');
        const topicID = addTopic('topic1', 1.0);
        addEdge('content', topicID, 'content:ggg', 1.0);
        const profile = createUserProfile('user:xyz', 'TestUser');
        profile.affinities.topics.topics = [{ label: 'topic1', weight: 0.5 }];
        const candidates = generateCandidates(profile, 10, { ...DEFAULT_OPTIONS, random: 0 });

        expect(candidates).toHaveLength(1);
        expect(candidates[0].candidateOrigin).toBe('topic_affinity');
        expect(candidates[0].contentId).toBe('content:ggg');
        expect(candidates[0].topicAffinity).toBe(0.5);
    });

    it('generates similar user candidates', async ({ expect }) => {
        addNode('content', 'content:ggg');
        const profile1 = createUserProfile('user:xyz', 'TestUser');
        const profile2 = createUserProfile('user:test1', 'TestUser2');
        profile1.embeddings.taste = normalise([1, 2, 3]);
        profile2.embeddings.taste = normalise([1, 2, 3]);
        profile2.affinities.contents.contents = [{ id: 'content:ggg', weight: 1 }];
        touchProfile(profile1.id);
        touchProfile(profile2.id);
        const candidates = generateCandidates(profile1, 10, { ...DEFAULT_OPTIONS, random: 0 });

        expect(candidates).toHaveLength(1);
        expect(candidates[0].candidateOrigin).toBe('similar_user');
        expect(candidates[0].contentId).toBe('content:ggg');
    });
});
