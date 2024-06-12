import { addEdge, getNodesByType, getNodesSince, getRelated, removeNode } from '@genaism/services/graph/graph';
import { GNode, NodeType, PartialEdge, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { useMemo } from 'react';
import { UserProfile } from '../profiler/profilerTypes';
import { removeCommentsBy } from '../content/content';
import { removeProfile } from '../profiler/state';
import { removeRecommendations } from '../recommender/recommender';
import { removeResearchData } from '../research/research';
import { normCosinesim } from '@genaism/util/embedding';

function embeddingScores(mine: number[], users: UserNodeId[]) {
    return users.map((user) => {
        const profile = getUserProfile(user);
        if (profile.embedding.length > 0 && mine.length > 0) {
            return { id: user, weight: normCosinesim(mine, profile.embedding) };
        } else {
            return { id: user, weight: 0 };
        }
    });
}

export function findSimilarUsers(id: UserNodeId): WeightedNode<UserNodeId>[] {
    const ownProfile = getUserProfile(id);

    // Step 1: Find candidate users.
    const users = new Set(getNodesByType('user'));
    users.delete(id);

    // Step 2: Calculate a similarity score
    // Get the taste profile of every candidate
    // Compare the taste profiles
    const userArray = Array.from(users);
    //const scores = calculateScores(taste, userArray);
    const scores = embeddingScores(ownProfile.embedding, userArray);

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

export function removeUser(id: UserNodeId) {
    removeCommentsBy(id);
    removeProfile(id);
    removeRecommendations(id);
    removeResearchData(id);
    removeNode(id);
}
