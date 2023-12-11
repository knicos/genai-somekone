import { getTopicId } from '../concept/concept';
import { ContentNodeId, Edge, UserNodeId } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { UserProfile } from '../profiler/profilerTypes';
import { calculateSimilarity } from '../users/users';
import { Recommendation, ScoredRecommendation } from './recommenderTypes';

export const WEIGHTS = {
    tasteSimilarity: 0.9,
    contentTrending: 0.0,
    topicTrending: 0.0,
    coengagementScore: 0.0,
    userSimilarityScore: 0.0,
    randomness: 0.1,
};

/*export function calculateLimitedSimilarity(a: WeightedNode<TopicNodeId>[], b: WeightedNode<TopicNodeId>[]): number {
    const sumA = a.reduce((p, v) => p + v.weight, 0);
    const sumB = b.reduce((p, v) => p + v.weight, 0);

    if (sumA < 0.0000001 || sumB < 0.0000001) return 0.0;

    const normA = a.map((v) => ({ id: v.id, weight: v.weight / sumA }));
    const normB = b.map((v) => ({ id: v.id, weight: v.weight / sumB }));

    const labelMap = new Map<string, { a: number; b: number }>();
    normA.forEach((v) => {
        labelMap.set(v.id, { a: v.weight, b: 0 });
    });
    normB.forEach((v) => {
        labelMap.set(v.id, { a: labelMap.get(v.id)?.a || 0, b: v.weight });
    });

    const larray = Array.from(labelMap).filter((l) => l[1].b > 0);
    const vec1 = larray.map((v) => v[1].a);
    const vec2 = larray.map((v) => v[1].b);
    return cosinesim(vec1, vec2);
}*/

function calculateTasteScore(profile: UserProfile, id: ContentNodeId): number {
    const topics = getRelated('topic', id, { count: 10 });
    return profile.taste.length > 0 && topics.length > 0
        ? calculateSimilarity(
              profile.taste.map((t) => ({ id: getTopicId(t.label), weight: t.weight })),
              topics
          )
        : 0;
}

const MIN5 = 5 * 60 * 1000;

export function scoreCandidates(
    candidates: Recommendation[],
    profile: UserProfile,
    count: number
): ScoredRecommendation[] {
    const now = Date.now();
    const seenImages = getRelated('seen', profile.id, {
        period: MIN5,
        weightFn: (edge: Edge<UserNodeId, ContentNodeId>) => (now - edge.timestamp) / MIN5,
    });
    const seenMap = new Map<ContentNodeId, number>();
    seenImages.forEach((s) => {
        seenMap.set(s.id, s.weight);
    });

    return candidates
        .map((c) => {
            const tasteSimilarityScore = WEIGHTS.tasteSimilarity * calculateTasteScore(profile, c.contentId);
            const randomnessScore = WEIGHTS.randomness * Math.random() * 0.1;
            const seenFactor = seenMap.has(c.contentId) ? seenMap.get(c.contentId) || 0 : 1;

            return {
                ...c,
                tasteSimilarityScore,
                contentTrendingScore: 0,
                topicTrendingScore: 0,
                coengagementScore: 0,
                userSimilarityScore: 0,
                randomnessScore,
                seenFactor,
                score: (tasteSimilarityScore + randomnessScore) * seenFactor,
                rank: 1,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}
