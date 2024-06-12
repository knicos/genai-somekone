import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { Recommendation } from '../recommenderTypes';
import { calculateCount } from './common';
import { getRelated } from '@genaism/services/graph/query';
import { getTopicId } from '@genaism/services/concept/concept';
import { uniformUniqueSubset } from '@genaism/util/subsets';

export function generateTasteBatch(profile: ProfileSummary, nodes: Recommendation[], count: number) {
    const taste = profile.topics;

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
