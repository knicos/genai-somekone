import { Recommendation } from '../recommenderTypes';
import { calculateCount } from './common';
import { getRelated } from '@genaism/services/graph/query';
import { betaProbability, biasedUniqueSubset } from '@genaism/util/subsets';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';

export function generateCoengaged(profile: UserNodeData, nodes: Recommendation[], count: number) {
    const engaged = profile.affinities.contents.contents;
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

export function coengagedProbability(profile: UserNodeData, count: number, id: ContentNodeId): number {
    const engaged = profile.affinities.contents.contents;
    //const high = engaged[0]?.weight || 0;
    //const low = engaged[engaged.length - 1]?.weight || 0;

    let sumP = 0;

    engaged.forEach((e) => {
        //const c = calculateCount(high, low, e.weight, count);
        // TODO: Consider using a popularity weighted edge here.
        const related = getRelated('coengaged', e.id);
        const ix = related.findIndex((v) => v.id === id);
        const p = ix >= 0 ? 1 - Math.pow(1 - betaProbability(ix, related.length), count) : 0;
        sumP = sumP + p - sumP * p;
    });

    return sumP;
}
