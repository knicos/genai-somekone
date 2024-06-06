import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { Recommendation } from '../recommenderTypes';
import { calculateCount } from './common';
import { getRelated } from '@genaism/services/graph/query';
import { biasedUniqueSubset } from '@genaism/util/subsets';

export function generateCoengaged(profile: ProfileSummary, nodes: Recommendation[], count: number) {
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
