import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { Recommendation } from '../recommenderTypes';
import { betaProbability, biasedUniqueSubset } from '@genaism/util/subsets';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { getSimilarUsers } from '@genaism/services/similarity/user';
import { getUserProfile } from '@genaism/services/profiler/profiler';

const NUM_SIMILAR_USERS = 5;

interface UserSuggestion extends WeightedNode<ContentNodeId> {
    user: UserNodeId;
    similarityScore: number;
}

function getSimilarUserImages(profile: UserNodeData) {
    // First, find similar users.
    //const similar = getRelated('similar', profile.id, { count: NUM_SIMILAR_USERS, timeDecay: 0.5, period: MIN20 });
    const similar = getSimilarUsers(profile.embeddings.taste, NUM_SIMILAR_USERS).filter(
        (s) => s.id !== profile.id && s.weight > 0
    );

    // For each similar user, get their favourite images.
    let results: UserSuggestion[] = [];
    similar.forEach((user) => {
        const best = getUserProfile(user.id)?.affinities.contents.contents || [];
        const wbest = best.map((b) => ({
            id: b.id,
            weight: b.weight * user.weight,
            user: user.id,
            similarityScore: user.weight,
        }));
        results = [...results, ...wbest];
    });

    results.sort((a, b) => b.weight - a.weight);
    return results;
}

// FIXME: Select different numbers of candidates from the similar users depending upon their weight. More
// candidates should come from those more similar users. Also, use biasedUniqueSubset to randomly select N from the
// larger set to avoid only ever considering the most recent ones. What are the performance implications of this?

export function generateSimilarUsers(profile: UserNodeData, nodes: Recommendation[], count: number) {
    const results = getSimilarUserImages(profile);
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

export function similarUserProbability(profile: UserNodeData, count: number, id: ContentNodeId): number {
    const results = getSimilarUserImages(profile);

    const probs = results.map((r, ix) =>
        r.id === id ? 1 - Math.pow(1 - betaProbability(ix, results.length), count) : 0
    );
    const p = probs.reduce((s, v) => s + v - s * v, 0);
    return p;
}
