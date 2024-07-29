import { getEdge } from '@genaism/services/graph/edges';
import { ContentNodeId, UserNodeId } from '@genaism/services/graph/graphTypes';

// This depends on number of images available and classroom activity rate.
const SEEN_TIME = 10 * 60 * 1000;

export function getLastSeenTime(userId: UserNodeId, contentId: ContentNodeId): number {
    const edge = getEdge('seen', userId, contentId);
    if (edge) {
        const now = Date.now();
        const diff = now - edge.timestamp;
        const norm = 1 - Math.min(1, diff / SEEN_TIME);
        return 1 - norm;
    }
    return 1;
}
