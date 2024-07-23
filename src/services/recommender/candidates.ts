import { CandidateOptions, Recommendation } from './recommenderTypes';
import { fillWithRandom, randomCandidateProbability } from './candidates/random';
import { generateSimilarUsers, similarUserProbability } from './candidates/similarUsers';
import { coengagedProbability, generateCoengaged } from './candidates/coengaged';
import { generateTasteBatch, tasteCandidateProbability } from './candidates/taste';
import { UserNodeData } from '../users/userTypes';
import { getPopularCandidates, popularProbability } from './candidates/popular';
import { ContentNodeId } from '../graph/graphTypes';

function _generateCandidates(profile: UserNodeData, count: number, options: CandidateOptions) {
    const nodes: Recommendation[] = [];

    const sumCounts = options.taste + options.coengaged + options.similarUsers + options.popular + options.random;
    const factor = 1 / sumCounts;

    if (count * options.taste * factor >= 1) generateTasteBatch(profile, nodes, count * options.taste * factor);
    if (count * options.coengaged * factor >= 1) generateCoengaged(profile, nodes, count * options.coengaged * factor);
    if (count * options.similarUsers * factor >= 1)
        generateSimilarUsers(profile, nodes, count * options.similarUsers * factor);
    if (count * options.popular * factor >= 1) getPopularCandidates(nodes, count * options.popular * factor);
    if (count * options.random * factor >= 1) fillWithRandom(nodes, count * options.random * factor);

    return nodes;
}

export function candidateProbabilities(
    profile: UserNodeData,
    count: number,
    options: CandidateOptions,
    id: ContentNodeId
): number {
    const sumCounts = options.taste + options.coengaged + options.similarUsers + options.popular + options.random;
    const factor = 1 / sumCounts;

    const probs = [
        count * options.taste * factor >= 1
            ? tasteCandidateProbability(profile, count * options.taste * factor, id)
            : 0,
        count * options.coengaged * factor >= 1
            ? coengagedProbability(profile, count * options.coengaged * factor, id)
            : 0,
        count * options.random * factor >= 1 ? randomCandidateProbability(count * options.random * factor) : 0,
        count * options.similarUsers * factor >= 1
            ? similarUserProbability(profile, count * options.similarUsers * factor, id)
            : 0,
        count * options.popular * factor >= 1 ? popularProbability(id, count * options.popular * factor) : 0,
    ];

    return probs.reduce((s, v) => s + v - s * v, 0);
}

export function generateCandidates(profile: UserNodeData, count: number, options: CandidateOptions): Recommendation[] {
    const selected = new Map<string, Recommendation>();

    let maxLoop = 2;
    while (selected.size < count && maxLoop-- > 0) {
        const nodes = _generateCandidates(profile, count, options);

        for (let i = 0; i < nodes.length; ++i) {
            if (!selected.has(nodes[i].contentId)) {
                selected.set(nodes[i].contentId, nodes[i]);
            }
        }
    }

    // Still less than expected, so do some random
    if (selected.size < count) {
        const nodes = _generateCandidates(profile, count, {
            taste: 0,
            coengaged: 0,
            similarUsers: 0,
            popular: 0,
            random: 2,
        });

        for (let i = 0; i < nodes.length; ++i) {
            if (!selected.has(nodes[i].contentId)) {
                selected.set(nodes[i].contentId, nodes[i]);
            }
        }
    }

    return Array.from(selected).map((s) => s[1]);
}
