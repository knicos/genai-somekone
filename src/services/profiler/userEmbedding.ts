import { normalise, weightedMeanEmbedding } from '@genaism/util/embedding';
import { getContentMetadata } from '../content/content';
import { UserNodeId } from '../graph/graphTypes';
import { getRelated } from '../graph/query';

const MAX_ENGAGEMENTS = 50;
const MAX_TIME = 60 * 60 * 1000;

export function generateEmbedding(id: UserNodeId) {
    const engaged = getRelated('engaged', id, { count: MAX_ENGAGEMENTS, timeDecay: 0.2, period: MAX_TIME }).filter(
        (e) => e.weight > 0
    );
    const em = engaged.map((content) => {
        const meta = getContentMetadata(content.id);
        if (meta) return meta.embedding || [];
        else return [];
    });
    const w = engaged.map((content) => content.weight);
    return normalise(weightedMeanEmbedding(em, w));
}
