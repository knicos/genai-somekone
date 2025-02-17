import { cosinesim, ProfilerService, UserNodeId } from '@knicos/genai-recom';

interface PairwiseDistance {
    d: number;
    a: UserNodeId;
    b: UserNodeId;
}

export default function disimilarUsers(profiler: ProfilerService, count: number): UserNodeId[] {
    if (count === 0) return [];

    if (count === 1) {
        const allUsers = profiler.getAllUsers() as UserNodeId[];
        const best = allUsers.reduce((b, u) => {
            if (b) {
                const p1 = profiler.getUserData(u);
                const p2 = profiler.getUserData(b);
                if (p1 && p2) {
                    return p1.engagement > p2.engagement ? u : b;
                }
                return u;
            } else {
                return u;
            }
        });
        return [best];
    }

    // Find most distant pair
    const allUsers = profiler.getAllUsers() as UserNodeId[];
    const distMap = new Map<UserNodeId, PairwiseDistance[]>();

    let maxSim = 1;
    let bestDist: PairwiseDistance | undefined;

    allUsers.forEach((u1) => {
        const p1 = profiler.getUserData(u1);
        if (p1?.name === 'NoName') return;
        const sorted: PairwiseDistance[] = allUsers.map((u2) => {
            if (u1 === u2) return { a: u1, b: u2, d: 1 };
            const p2 = profiler.getUserData(u2);
            if (p1 && p2 && p2?.name !== 'NoName') {
                const d = cosinesim(p1.embeddings.taste, p2.embeddings.taste);
                const e = { a: u1, b: u2, d };
                if (d < maxSim) {
                    maxSim = d;
                    bestDist = e;
                }
                return e;
            }
            return { a: u1, b: u2, d: 1 };
        });
        sorted.sort((a, b) => {
            return a.d - b.d;
        });
        distMap.set(u1, sorted);
    });

    const result: UserNodeId[] = [];
    if (bestDist) {
        result.push(bestDist.a);
        result.push(bestDist.b);
    }

    if (result.length === 0) return result;

    // Now add in nodes until count is reached.

    return result;
}
