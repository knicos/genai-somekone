import { getRelated } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { WeightedNode } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { useMemo } from 'react';
import { UserProfile } from '../profiler/profilerTypes';

function identifyCandidateUsers(users: Set<string>, candidates: WeightedNode[]) {
    candidates.forEach((c) => {
        users.add(c.id);
    });
}

export function cosinesim(A: number[], B: number[]): number {
    let dotproduct = 0;
    let mA = 0;
    let mB = 0;

    for (let i = 0; i < A.length; i++) {
        dotproduct += A[i] * B[i];
        mA += A[i] * A[i];
        mB += B[i] * B[i];
    }

    mA = Math.sqrt(mA);
    mB = Math.sqrt(mB);
    const similarity = dotproduct / (mA * mB);

    return similarity;
}

export function calculateSimilarity(a: WeightedNode[], b: WeightedNode[]): number {
    const sumA = a.reduce((p, v) => p + v.weight, 0);
    const sumB = b.reduce((p, v) => p + v.weight, 0);
    const normA = a.map((v) => ({ id: v.id, weight: v.weight / sumA }));
    const normB = b.map((v) => ({ id: v.id, weight: v.weight / sumB }));

    const labelMap = new Map<string, { a: number; b: number }>();
    normA.forEach((v) => {
        labelMap.set(v.id, { a: v.weight, b: 0 });
    });
    normB.forEach((v) => {
        labelMap.set(v.id, { a: labelMap.get(v.id)?.a || 0, b: v.weight });
    });

    const larray = Array.from(labelMap);
    const vec1 = larray.map((v) => v[1].a);
    const vec2 = larray.map((v) => v[1].b);
    return cosinesim(vec1, vec2);
}

function generateCandidates(engaged: WeightedNode[], taste: WeightedNode[]): Set<string> {
    const users = new Set<string>();
    identifyCandidateUsers(
        users,
        getRelated(
            'engaged',
            engaged.map((e) => e.id),
            10
        )
    );
    identifyCandidateUsers(
        users,
        getRelated(
            'topic',
            taste.map((e) => e.id),
            10
        )
    );
    return users;
}

function calculateScores(taste: WeightedNode[], users: string[]): WeightedNode[] {
    return users.map((user) => {
        const profile = getUserProfile(user);
        return {
            id: user,
            weight: calculateSimilarity(
                taste,
                profile.taste.map((t) => ({ id: getTopicId(t.label), weight: t.weight }))
            ),
        };
    });
}

export function findSimilarUsers(id: string): WeightedNode[] {
    const ownProfile = getUserProfile(id);
    const engaged = ownProfile.engagedContent;
    const taste = ownProfile.taste.map((t) => ({ id: getTopicId(t.label), weight: t.weight }));

    // Step 1: Find candidate users.
    const users = generateCandidates(engaged, taste);
    users.delete(id);

    // Step 2: Calculate a similarity score
    // Get the taste profile of every candidate
    // Compare the taste profiles
    const userArray = Array.from(users);
    const scores = calculateScores(taste, userArray);

    // Step 3: Sort and limit the result
    scores.sort((a, b) => b.weight - a.weight);

    console.log('Simialr', scores);

    return scores.slice(0, 10);
}

export function useSimilarUsers(profile: UserProfile) {
    return useMemo(() => {
        return findSimilarUsers(profile.id);
    }, [profile]);
}
