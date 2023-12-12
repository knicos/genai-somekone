import { getNodesByType, getRelated } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { ProfileSummary, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { Recommendation } from './recommenderTypes';

function calculateCount(high: number, low: number, value: number, max: number) {
    return Math.floor(((value - low) / (high - low)) * (max - 1) + 1);
}

function generateTasteBatch(profile: ProfileSummary, nodes: Recommendation[], count: number) {
    const taste = profile.taste;

    const high = taste[0]?.weight || 0;
    const low = taste[taste.length - 1]?.weight || 0;

    taste.forEach((t) => {
        if (t.weight > 0) {
            const c = calculateCount(high, low, t.weight, count);
            // TODO: Consider using a popularity weighted edge here.
            const tresult = getRelated('content', getTopicId(t.label), { count: c });
            tresult.forEach((tr) =>
                nodes.push({
                    contentId: tr.id,
                    candidateOrigin: 'topic_affinity',
                    timestamp: Date.now(),
                    topicAffinity: t.weight * tr.weight,
                    topic: t.label,
                })
            );
        }
    });
}

function fillWithRandom(nodes: Recommendation[], count: number) {
    const allNodes = getNodesByType('content');
    if (allNodes.length === 0) return;

    for (let i = 0; i < count; ++i) {
        const ix = Math.floor(Math.random() * allNodes.length);
        nodes.push({
            contentId: allNodes[ix],
            candidateOrigin: 'random',
            timestamp: Date.now(),
        });
    }
}

export function generateCandidates(profile: UserProfile, count: number): Recommendation[] {
    const nodes: Recommendation[] = [];
    generateTasteBatch(profile, nodes, count * 2);
    fillWithRandom(nodes, count);

    console.log('PROFILE', profile);

    const selected = new Map<string, Recommendation>();

    for (let i = 0; i < nodes.length; ++i) {
        if (!selected.has(nodes[i].contentId)) {
            selected.set(nodes[i].contentId, nodes[i]);
        }
    }

    return Array.from(selected).map((s) => s[1]);
}
