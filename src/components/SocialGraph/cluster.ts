import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';

export function clusterUsers(
    users: UserNodeId[],
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>,
    similarity: number
): Map<UserNodeId, WeightedLabel> {
    const clusters = new Map<UserNodeId, WeightedLabel>();
    //const initialTopics = new Set<string>();
    //const tasteMap = new Map<UserNodeId, Map<string, number>>();

    users.forEach((user) => {
        const s = similar.get(user);
        if (s) {
            const maxWeight = s[0]?.weight || 1;
            const score = s.reduce((sum, v) => sum + v.weight / maxWeight, 0) / s.length;
            clusters.set(user, { label: user, weight: score });
        }
    });

    for (let i = 0; i < 2; ++i) {
        users.forEach((user) => {
            const s = similar.get(user);
            const self = clusters.get(user);
            if (s && self) {
                const maxWeight = s[0]?.weight || 0;
                s.forEach((neighbour) => {
                    const nScore = clusters.get(neighbour.id);
                    if (nScore && neighbour.weight >= (1 - similarity) * maxWeight) {
                        if (nScore.weight * (neighbour.weight / maxWeight) > self.weight) {
                            self.weight = nScore.weight;
                            self.label = nScore.label;
                        }
                    }
                });
            }
        });
    }

    return clusters;
}
