import { getNodesByType, getRelated } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { ProfileSummary, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { Recommendation } from './recommenderTypes';
import { uniformUniqueSubset } from '@genaism/util/subsets';

function calculateCount(high: number, low: number, value: number, max: number) {
    const range = high - low;
    if (range === 0) return 1;
    return Math.floor(((value - low) / range) * (max - 1) + 1);
}

function generateTasteBatch(profile: ProfileSummary, nodes: Recommendation[], count: number) {
    const taste = profile.taste;

    const high = taste[0]?.weight || 0;
    const low = taste[taste.length - 1]?.weight || 0;

    taste.forEach((t) => {
        if (t.weight > 0) {
            const c = calculateCount(high, low, t.weight, count);
            // TODO: Consider using a popularity weighted edge here.
            const related = getRelated('content', getTopicId(t.label));
            const tresult = uniformUniqueSubset(related, c, (v) => v.id);

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

    const now = Date.now();
    const randomNodes = uniformUniqueSubset(allNodes, count, (v) => v);
    randomNodes.forEach((node) => {
        nodes.push({
            contentId: node,
            candidateOrigin: 'random',
            timestamp: now,
        });
    });
}

export interface CandidateOptions {
    noTaste?: boolean;
    noRandom?: boolean;
    allowDuplicates?: boolean;
}

export function generateCandidates(profile: UserProfile, count: number, options?: CandidateOptions): Recommendation[] {
    const nodes: Recommendation[] = [];

    if (!options?.noTaste) generateTasteBatch(profile, nodes, count * 2);
    if (!options?.noRandom) fillWithRandom(nodes, count);

    console.log('PROFILE', profile);

    const selected = new Map<string, Recommendation>();

    for (let i = 0; i < nodes.length; ++i) {
        if (!selected.has(nodes[i].contentId)) {
            selected.set(nodes[i].contentId, nodes[i]);
        }
    }

    return Array.from(selected).map((s) => s[1]);
}
