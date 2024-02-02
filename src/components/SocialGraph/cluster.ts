import { WeightedLabel } from '@genaism/services/content/contentTypes';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { calculateSimilarityLabels } from '@genaism/services/users/users';

function indexOfMin(v: number[]) {
    let min = Number.POSITIVE_INFINITY;
    let minIx = -1;

    for (let i = 0; i < v.length; ++i) {
        if (v[i] < min) {
            min = v[i];
            minIx = i;
        }
    }

    return minIx;
}

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

function mapFromLabels(labels: WeightedLabel[]): Map<string, number> {
    const result = new Map<string, number>();
    labels.forEach((label) => {
        result.set(label.label, label.weight);
    });
    return result;
}

function leastSimilarUser(means: Map<string, number>[], users: UserNodeId[]) {
    const scores = users.map((user) => {
        const profile = getUserProfile(user);
        if (profile && profile.name !== 'NoName') {
            const taste = profile.taste;
            let score = 0;
            means.forEach((m) => {
                score += calculateSimilarityLabels(taste, m);
            });
            return score;
        }
        return Number.POSITIVE_INFINITY;
    });

    const ix = indexOfMin(scores);
    return users[ix];
}

export function clusterUsers(
    users: UserNodeId[],
    similar: Map<UserNodeId, WeightedNode<UserNodeId>[]>,
    k: number
): Map<UserNodeId, WeightedLabel> {
    const clusters = new Map<UserNodeId, WeightedLabel>();

    const means: Map<string, number>[] = [];

    const userScores = users.map((user) => similar.get(user)?.reduce((sum, v) => sum + v.weight, 0) || 0);
    const firstUser = indexOfMax(userScores);

    // Populate with initial cluster means
    means.push(mapFromLabels(getUserProfile(users[firstUser])?.taste || []));
    for (let i = 1; i < k; ++i) {
        means.push(mapFromLabels(getUserProfile(leastSimilarUser(means, users))?.taste || []));
    }

    for (let i = 0; i < 3; ++i) {
        const members: UserNodeId[][] = [];
        for (let j = 0; j < k; ++j) members.push([]);

        users.forEach((user) => {
            const profile = getUserProfile(user);
            if (profile && profile.name !== 'NoName') {
                const taste = profile.taste;
                const sim = means.map((m) => calculateSimilarityLabels(taste, m));
                const c = indexOfMin(sim);
                members[c].push(user);
                clusters.set(user, { label: `cluster${c}`, weight: sim[c] });
            }
        });

        // Update means
        members.forEach((cluster, ix) => {
            const newMeans = new Map<string, number>();

            cluster.forEach((user) => {
                const profile = getUserProfile(user);
                if (profile) {
                    profile.taste.forEach((t) => {
                        newMeans.set(t.label, (newMeans.get(t.label) || 0) + t.weight);
                    });
                }
            });

            newMeans.forEach((v, k) => {
                newMeans.set(k, v / cluster.length);
            });

            means[ix] = newMeans;
        });
    }

    return clusters;
}
