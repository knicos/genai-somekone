import { debounce, Debouncer } from '@genaism/util/debounce';
import { randomId } from '@genai-fi/base';
import {
    clusterEmbeddings,
    findSimilarUsers,
    ProfilerService,
    UserNodeId,
    WeightedLabel,
    WeightedNode,
} from '@knicos/genai-recom';
import EE from 'eventemitter3';

function getSimilar(
    profiler: ProfilerService,
    id: UserNodeId,
    similarities: Map<UserNodeId, WeightedNode<UserNodeId>[]>
) {
    const s = findSimilarUsers(profiler.graph, profiler, id);
    similarities.set(
        id,
        s.filter((ss) => ss.weight > 0 && ss.id !== id)
    );
}

function safeGetProfile(profiler: ProfilerService, user: UserNodeId) {
    try {
        return profiler.getUserProfile(user);
    } catch {
        return null;
    }
}

export default class SimilarityService extends EE {
    private profiler: ProfilerService;
    private debouncer: Debouncer<() => void>;
    private users: UserNodeId[] = [];
    private similar = new Map<UserNodeId, WeightedNode<UserNodeId>[]>();
    private clusters = new Map<UserNodeId, WeightedLabel>();
    private k = 0;
    private availableLabels = new Set<string>();

    constructor(profiler: ProfilerService) {
        super();
        this.profiler = profiler;

        this.debouncer = debounce(() => {
            this.update();
        }, 500);

        this.profiler.broker.on('profile', () => {
            this.debouncer[0]();
        });

        this.update();
    }

    public reset() {
        this.clusters.clear();
        this.users = [];
        this.similar.clear();
        this.update();
    }

    private clusterUsers(): Map<UserNodeId, WeightedLabel> {
        const clusters = new Map<UserNodeId, WeightedLabel>();

        const userEmbeddings = this.users
            .map((user) => ({ id: user, embedding: safeGetProfile(this.profiler, user)?.embeddings.taste || [] }))
            .filter((u) => u.embedding.length > 0);
        const rawClusters = clusterEmbeddings(userEmbeddings, { k: this.k });

        rawClusters.sort((a, b) => b.length - a.length);

        const usedLabels = new Set<string>();

        this.clusters.forEach((v) => {
            this.availableLabels.add(v.label);
        });

        const tallyMap = rawClusters.map((cluster) => {
            const tally = new Map<string, number>();

            cluster.forEach((member) => {
                const u = userEmbeddings[member].id;
                const p = this.clusters.get(u);
                if (p) {
                    tally.set(p.label, (tally.get(p.label) || 0) + 1);
                }
            });

            const labelArray: [string, number][] = Array.from(tally);
            labelArray.sort((a, b) => b[1] - a[1]);
            labelArray.forEach((l) => {
                tally.set(l[0], (tally.get(l[0]) || 0) + 1);
            });
            return { labels: labelArray, cluster };
        });

        tallyMap.sort((a, b) => (b.labels[0]?.[1] || 0) - (a.labels[0]?.[1] || 0));

        const todo: number[] = [];

        tallyMap.forEach((cluster, ix) => {
            let label: string | null = null;
            for (let i = 0; i < cluster.labels.length; ++i) {
                if (!usedLabels.has(cluster.labels[i][0])) {
                    label = cluster.labels[i][0];
                    break;
                }
            }
            if (!label) {
                todo.push(ix);
                return;
            }
            usedLabels.add(label);
            this.availableLabels.delete(label);

            cluster.cluster.forEach((member) => {
                const u = userEmbeddings[member].id;
                clusters.set(u, { label, weight: 1 });
            });
        });

        todo.forEach((ix) => {
            const cluster = tallyMap[ix];
            const label = this.availableLabels.size > 0 ? Array.from(this.availableLabels)[0] : randomId(5);
            this.availableLabels.delete(label);
            cluster.cluster.forEach((member) => {
                const u = userEmbeddings[member].id;
                clusters.set(u, { label, weight: 1 });
            });
        });

        return clusters;
    }

    private update() {
        this.users = this.profiler.graph.getNodesByType('user');
        this.users.forEach((c) => {
            getSimilar(this.profiler, c, this.similar);
        });
        if (this.k > 0) {
            this.clusters = this.clusterUsers();
        } else {
            this.clusters.clear();
        }
        this.emit('updated');
    }

    public setK(k: number) {
        this.k = Math.max(0, Math.min(k, 20));
        this.update();
    }

    public getUsers() {
        return this.users;
    }

    public getSimilar() {
        return this.similar;
    }

    public getClusters() {
        return this.clusters;
    }
}
