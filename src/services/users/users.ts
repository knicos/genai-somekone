import { addEdge, getNodeData, getNodesSince, removeNode } from '@genaism/services/graph/graph';
import { GNode, NodeType, PartialEdge, UserNodeId, WeightedNode } from '../graph/graphTypes';
import { getUserProfile } from '../profiler/profiler';
import { removeCommentsBy } from '../content/content';
import { removeProfile } from '../profiler/state';
import { removeRecommendations } from '../recommender/recommender';
import { removeResearchData } from '../research/research';
import { UserNodeData } from './userTypes';
import { getSimilarUsers } from '../similarity/user';
import { UserLogEntry } from './state';
import { getActionLogTypeSince } from './logs';

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
    logs: UserLogEntry[];
}

export function makeUserSnapshot(id: UserNodeId, since: number, first: boolean): Snapshot {
    const nodes = getNodesSince('user', since).filter((u) => u.id !== id);
    const logs = getActionLogTypeSince(since, 'engagement').filter((l) => (l.entry.value || 0) > 0);
    return { edges: [], nodes, logs: first ? logs : logs.filter((l) => l.user !== id) };
}

export function removeUser(id: UserNodeId) {
    removeCommentsBy(id);
    removeProfile(id);
    removeRecommendations(id);
    removeResearchData(id);
    removeNode(id);
}
