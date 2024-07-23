import { Recommendation } from '../recommenderTypes';
import { calculateCount } from './common';
import { getRelated } from '@genaism/services/graph/query';
import { getTopicId, getTopicLabel } from '@genaism/services/concept/concept';
import { uniformUniqueSubset } from '@genaism/util/subsets';
import { UserNodeData } from '@genaism/services/users/userTypes';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';

export function generateTasteBatch(profile: UserNodeData, nodes: Recommendation[], count: number) {
    const taste = profile.affinities.topics.topics;

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

export function tasteCandidateProbability(profile: UserNodeData, count: number, id: ContentNodeId): number {
    const taste = profile.affinities.topics.topics;
    const high = taste[0]?.weight || 0;
    const low = taste[taste.length - 1]?.weight || 0;

    const contentLabels = new Set(getRelated('topic', id).map((l) => getTopicLabel(l.id)));

    let sumProb = 0;

    taste.forEach((t) => {
        const c = calculateCount(high, low, t.weight, count);
        const related = getRelated('content', getTopicId(t.label));
        const p = contentLabels.has(t.label) ? 1 - Math.pow(1 - 1 / related.length, c) : 0;
        sumProb = sumProb + p - sumProb * p;
    });
    return sumProb;
}
