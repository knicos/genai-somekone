import { CandidateOptions, Recommendation } from './recommenderTypes';
import { fillWithRandom } from './candidates/random';
import { generateSimilarUsers } from './candidates/similarUsers';
import { generateCoengaged } from './candidates/coengaged';
import { generateTasteBatch } from './candidates/taste';
import { UserNodeData } from '../users/userTypes';

function _generateCandidates(profile: UserNodeData, count: number, options: CandidateOptions) {
    const nodes: Recommendation[] = [];

    if (options.taste > 0) generateTasteBatch(profile, nodes, count * options.taste);
    if (options.coengaged > 0) generateCoengaged(profile, nodes, count * options.coengaged);
    if (options.similarUsers > 0) generateSimilarUsers(profile, nodes, count * options.similarUsers);
    if (options.random > 0) fillWithRandom(nodes, count * options.random);

    return nodes;
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
