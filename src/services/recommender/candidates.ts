import { getNodesByType, getRelated } from '@genaism/services/graph/graph';
import { getTopicId } from '@genaism/services/concept/concept';
import { ProfileSummary, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { CandidateOptions, Recommendation } from './recommenderTypes';
import { biasedUniqueSubset, uniformUniqueSubset } from '@genaism/util/subsets';
import { ContentNodeId, UserNodeId, WeightedNode } from '../graph/graphTypes';

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

function generateCoengaged(profile: ProfileSummary, nodes: Recommendation[], count: number) {
    const engaged = profile.engagedContent;
    const high = engaged[0]?.weight || 0;
    const low = engaged[engaged.length - 1]?.weight || 0;

    engaged.forEach((e) => {
        const c = calculateCount(high, low, e.weight, count);
        // TODO: Consider using a popularity weighted edge here.
        const related = getRelated('coengaged', e.id);
        const result = biasedUniqueSubset(related, c, (v) => v.id);
        result.forEach((tr) =>
            nodes.push({
                contentId: tr.id,
                candidateOrigin: 'coengagement',
                timestamp: Date.now(),
                engagedItem: e.id,
                engagedItemScore: e.weight,
                coengagementScore: tr.weight,
            })
        );
    });
}

const MIN20 = 20 * 60 * 1000;

interface UserSuggestion extends WeightedNode<ContentNodeId> {
    user: UserNodeId;
    similarityScore: number;
}

function generateSimilarUsers(profile: UserProfile, nodes: Recommendation[], count: number) {
    // First, find similar users.
    const similar = getRelated('similar', profile.id, { count: 15, timeDecay: 0.5, period: MIN20 });
    const biasedSimilar = biasedUniqueSubset(similar, 5, (v) => v.id);

    // For each similar user, get their favourite images.
    let results: UserSuggestion[] = [];
    biasedSimilar.forEach((user) => {
        const best = getRelated('engaged', user.id, { count: 10, period: MIN20, timeDecay: 0.8 });
        // console.log('SIMILAR', best);
        const wbest = best.map((b) => ({
            id: b.id,
            weight: b.weight * user.weight,
            user: user.id,
            similarityScore: user.weight,
        }));
        results = [...results, ...wbest];
    });

    results.sort((a, b) => b.weight - a.weight);
    const final = biasedUniqueSubset(results, count, (v) => v.id);
    final.forEach((r) => {
        nodes.push({
            contentId: r.id,
            candidateOrigin: 'similar_user',
            timestamp: Date.now(),
            similarUser: r.user,
            userSimilarityScore: r.similarityScore,
        });
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

export function generateCandidates(profile: UserProfile, count: number, options: CandidateOptions): Recommendation[] {
    const nodes: Recommendation[] = [];

    if (options.taste > 0) generateTasteBatch(profile, nodes, count * options.taste);
    if (options.coengaged > 0) generateCoengaged(profile, nodes, count * options.coengaged);
    if (options.similarUsers > 0) generateSimilarUsers(profile, nodes, count * options.similarUsers);
    if (options.random > 0) fillWithRandom(nodes, count * options.random);

    const selected = new Map<string, Recommendation>();

    for (let i = 0; i < nodes.length; ++i) {
        if (!selected.has(nodes[i].contentId)) {
            selected.set(nodes[i].contentId, nodes[i]);
        }
    }

    return Array.from(selected).map((s) => s[1]);
}
