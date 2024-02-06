import { addEdge, getNodesByType, getNodesSince, getRelated } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import {
    ContentNodeId,
    GNode,
    NodeType,
    PartialEdge,
    TopicNodeId,
    UserNodeId,
    WeightedNode,
} from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { useMemo } from 'react';
import { UserProfile } from '../profiler/profilerTypes';
import { WeightedLabel } from '../content/contentTypes';

function identifyCandidateUsers(users: Set<UserNodeId>, candidates: WeightedNode<UserNodeId>[]) {
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

export function calculateSimilarityLabels(a: WeightedLabel[], b: Map<string, number>): number {
    const sumA = a.reduce((p, v) => p + v.weight, 0);
    let sumB = 0;
    b.forEach((v) => {
        sumB += v;
    });

    if (sumA === 0 || sumB === 0) return 0;
    const normA = a.map((v) => ({ id: v.label, weight: v.weight / sumA }));
    const normB = new Map<string, number>();
    b.forEach((v, k) => {
        normB.set(k, v / sumB);
    });

    const labelMap = new Map<string, { a: number; b: number }>();
    normA.forEach((v) => {
        labelMap.set(v.id, { a: v.weight, b: 0 });
    });
    normB.forEach((v, k) => {
        labelMap.set(k, { a: labelMap.get(k)?.a || 0, b: v });
    });

    const larray = Array.from(labelMap);
    const vec1 = larray.map((v) => v[1].a);
    const vec2 = larray.map((v) => v[1].b);
    return cosinesim(vec1, vec2);
}

export function calculateSimilarity(a: WeightedNode<TopicNodeId>[], b: WeightedNode<TopicNodeId>[]): number {
    const sumA = a.reduce((p, v) => p + v.weight, 0);
    const sumB = b.reduce((p, v) => p + v.weight, 0);
    if (sumA === 0 || sumB === 0) return 0;
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

function generateCandidates(
    engaged: WeightedNode<ContentNodeId>[],
    taste: WeightedNode<TopicNodeId>[]
): Set<UserNodeId> {
    const users = new Set<UserNodeId>();
    identifyCandidateUsers(
        users,
        getRelated(
            'engaged',
            engaged.map((e) => e.id),
            { count: 10 }
        )
    );
    identifyCandidateUsers(
        users,
        getRelated(
            'topic',
            taste.map((e) => e.id),
            { count: 10 }
        )
    );
    return users;
}

function calculateScores(taste: WeightedNode<TopicNodeId>[], users: UserNodeId[]): WeightedNode<UserNodeId>[] {
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

export function findSimilarUsers(id: UserNodeId): WeightedNode<UserNodeId>[] {
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
    const limited = scores.slice(0, 10);

    // Cache the results in the graph
    limited.forEach((sim) => {
        if (sim.weight > 0) addEdge('similar', id, sim.id, sim.weight);
    });

    return limited;
}

export function useSimilarUsers(profile: UserProfile) {
    return useMemo(() => {
        return findSimilarUsers(profile.id);
    }, [profile]);
}

export interface Snapshot {
    edges: PartialEdge[];
    nodes: GNode<NodeType>[];
}

export function makeUserGraphSnapshot(id: UserNodeId, period: number): Snapshot {
    const results: PartialEdge[] = [];
    const engaged = getRelated('engaged', id, { count: 10, strictPeriod: period });
    engaged.forEach((e) => {
        const coengaged = getRelated('coengaged', e.id, { count: 10, strictPeriod: period });
        coengaged.forEach((c) => {
            results.push({ source: e.id, destination: c.id, weight: c.weight, type: 'coengaged' });
        });
    });

    const similar = getRelated('similar', id, { count: 10, strictPeriod: period });
    similar.forEach((s) => {
        results.push({ source: id, destination: s.id, weight: s.weight, type: 'similar' });
    });

    // Should restrict this
    const allUsers = getNodesByType('user');
    allUsers.forEach((user) => {
        if (user === id) return;
        const engaged = getRelated('engaged', user, { count: 10, strictPeriod: period });
        engaged.forEach((e) => {
            results.push({ source: user, destination: e.id, weight: e.weight, type: 'engaged' });
        });
    });

    return { edges: results, nodes: getNodesSince('user', Date.now() - period).filter((u) => u.id !== id) };
}
