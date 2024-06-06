import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import { Recommendation } from '../recommenderTypes';
import { getRelated } from '@genaism/services/graph/query';
import { biasedUniqueSubset } from '@genaism/util/subsets';

const MIN20 = 20 * 60 * 1000;
const NUM_SIMILAR_USERS = 5;
const IMAGES_PER_USER = 30;

interface UserSuggestion extends WeightedNode<ContentNodeId> {
    user: UserNodeId;
    similarityScore: number;
}

// FIXME: Select different numbers of candidates from the similar users depending upon their weight. More
// candidates should come from those more similar users. Also, use biasedUniqueSubset to randomly select N from the
// larger set to avoid only ever considering the most recent ones. What are the performance implications of this?

export function generateSimilarUsers(profile: UserProfile, nodes: Recommendation[], count: number) {
    // First, find similar users.
    const similar = getRelated('similar', profile.id, { count: NUM_SIMILAR_USERS, timeDecay: 0.5, period: MIN20 });

    // For each similar user, get their favourite images.
    let results: UserSuggestion[] = [];
    similar.forEach((user) => {
        const best = getRelated('engaged', user.id, { count: IMAGES_PER_USER, period: MIN20, timeDecay: 0.8 });
        const wbest = best.map((b) => ({
            id: b.id,
            weight: b.weight * user.weight,
            user: user.id,
            similarityScore: user.weight,
        }));
        results = [...results, ...wbest];
    });

    results.sort((a, b) => b.weight - a.weight);
    const final = biasedUniqueSubset(results, count, (v) => v.id);
    final.forEach((r) => {
        nodes.push({
            contentId: r.id,
            candidateOrigin: 'similar_user',
            timestamp: Date.now(),
            similarUser: r.user,
            userSimilarityScore: r.similarityScore,
        });
    });
}
