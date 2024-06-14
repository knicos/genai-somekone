import { addEdge, getNodeData, getNodesSince, removeNode } from '@genaism/services/graph/graph';
import { GNode, NodeType, PartialEdge, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { removeCommentsBy } from '../content/content';
import { removeProfile } from '../profiler/state';
import { removeRecommendations } from '../recommender/recommender';
import { removeResearchData } from '../research/research';
import { UserNodeData } from './userTypes';
import { getSimilarUsers } from '../similarity/user';

export function getUserData(id: UserNodeId): UserNodeData | undefined {
    return getNodeData<UserNodeData>(id);
}

export function findSimilarUsers(id: UserNodeId): WeightedNode<UserNodeId>[] {
    const ownProfile = getUserProfile(id);
    const similar = getSimilarUsers(ownProfile.embeddings.taste, 10);

    // Cache the results in the graph
    similar.forEach((sim) => {
        if (sim.weight > 0) addEdge('similar', id, sim.id, sim.weight);
    });

    return similar;
}

export interface Snapshot {
    edges: PartialEdge[];
    nodes: GNode<NodeType>[];
}

export function makeUserGraphSnapshot(id: UserNodeId, period: number): Snapshot {
    const nodes = getNodesSince('user', Date.now() - period).filter((u) => u.id !== id);
    return { edges: [], nodes };
}

export function removeUser(id: UserNodeId) {
    removeCommentsBy(id);
    removeProfile(id);
    removeRecommendations(id);
    removeResearchData(id);
    removeNode(id);
}
