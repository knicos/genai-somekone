import { getTopicId } from '../concept/concept';
import { ContentNodeId, TopicNodeId, WeightedNode } from '../graph/graphTypes';
import { getRelated } from '../graph/query';
import { UserProfile } from '../profiler/profilerTypes';
import { cosinesim } from '../users/users';
import { Recommendation, ScoredRecommendation } from './recommenderTypes';

const WEIGHTS = {
    tasteSimilarity: 1.0,
    contentTrending: 0.0,
    topicTrending: 0.0,
    coengagementScore: 0.0,
    userSimilarityScore: 0.0,
    randomnessScore: 0.0,
};

export function calculateLimitedSimilarity(a: WeightedNode<TopicNodeId>[], b: WeightedNode<TopicNodeId>[]): number {
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
}

function calculateTasteScore(profile: UserProfile, id: ContentNodeId): number {
    const topics = getRelated('topic', id, { count: 10 });
    return calculateLimitedSimilarity(
        profile.taste.map((t) => ({ id: getTopicId(t.label), weight: t.weight })),
        topics
    );
}

export function scoreCandidates(
    candidates: Recommendation[],
    profile: UserProfile,
    count: number
): ScoredRecommendation[] {
    return candidates
        .map((c) => {
            const tasteSimilarityScore = WEIGHTS.tasteSimilarity * calculateTasteScore(profile, c.contentId);

            return {
                ...c,
                tasteSimilarityScore,
                contentTrendingScore: 0,
                topicTrendingScore: 0,
                coengagementScore: 0,
                userSimilarityScore: 0,
                randomnessScore: 0,
                seenFactor: 0,
                score: tasteSimilarityScore,
                rank: 1,
            };
        })
        .sort((a, b) => b.score - a.score)
        .slice(0, count);
}
