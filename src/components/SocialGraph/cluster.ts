import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { calculateSimilarityLabels } from '@genaism/services/users/users';

function indexOfMax(v: number[]) {
    let max = Number.NEGATIVE_INFINITY;
    let maxIx = -1;

    for (let i = 0; i < v.length; ++i) {
        if (v[i] > max) {
            max = v[i];
            maxIx = i;
        }
    }

    return maxIx;
}

export function clusterMean(members: UserNodeId[]): Map<string, number> {
    const newMeans = new Map<string, number>();

    members.forEach((user) => {
        const profile = getUserProfile(user);
        if (profile) {
            profile.taste.forEach((t) => {
                newMeans.set(t.label, (newMeans.get(t.label) || 0) + t.weight);
            });
        }
    });

    newMeans.forEach((v, k) => {
        newMeans.set(k, v / members.length);
    });

    return newMeans;
}

export function assignToCluster(means: Map<string, number>[], user: UserNodeId): number {
    const profile = getUserProfile(user);
    if (profile && profile.name !== 'NoName') {
        const taste = profile.taste;
        const sim = means.map((m) => calculateSimilarityLabels(taste, m));
        const c = indexOfMax(sim);
        return c;
    }
    return -1;
}

export function initialiseClusters(means: Map<string, number>[], k: number, users: UserNodeId[]) {
    // Find the most common labels.
    const popular = new Map<string, number>();
    users.forEach((user) => {
        const profile = getUserProfile(user);
        if (profile && profile.taste.length > 0) {
            const t = profile.taste[0];
            const v = popular.get(t.label) || 0;
            popular.set(t.label, t.weight + v);
        }
    });

    const popArray = Array.from(popular);
    popArray.sort((a, b) => b[1] - a[1]);
    popArray.splice(k);

    const membership: UserNodeId[][] = [];
    for (let j = 0; j < k; ++j) membership.push([]);
    users.forEach((user) => {
        const profile = getUserProfile(user);
        if (profile && profile.taste.length > 0) {
            const t = profile.taste[0];
            for (let i = 0; i < popArray.length; ++i) {
                if (t.label === popArray[i][0]) {
                    membership[i].push(user);
                    break;
                }
            }
        }
    });

    membership.forEach((cluster) => {
        means.push(clusterMean(cluster));
    });
}

export function clusterUsers(users: UserNodeId[], k: number): Map<UserNodeId, WeightedLabel> {
    const clusters = new Map<UserNodeId, WeightedLabel>();

    const means: Map<string, number>[] = [];

    initialiseClusters(means, k, users);

    for (let i = 0; i < 3; ++i) {
        const members: UserNodeId[][] = [];
        for (let j = 0; j < k; ++j) members.push([]);

        users.forEach((user) => {
            const c = assignToCluster(means, user);
            if (c >= 0) {
                members[c].push(user);
                clusters.set(user, { label: `cluster${c}`, weight: 1 });
            }
        });

        // Update means
        members.forEach((cluster, ix) => {
            means[ix] = clusterMean(cluster);
        });
    }

    return clusters;
}
