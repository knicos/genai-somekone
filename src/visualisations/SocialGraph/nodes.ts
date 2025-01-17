import { ProfilerService, UserNodeId } from '@knicos/genai-recom';
import { GraphNode } from '../Graph/types';
import { SimilarityData } from '@genaism/hooks/similarity';
import { colourLabel } from './colourise';

export function patchNodes(
    profiler: ProfilerService,
    nodes: GraphNode<UserNodeId>[],
    users: UserNodeId[],
    sizes: Map<string, number>,
    similarity: SimilarityData
) {
    const oldMap = new Map<UserNodeId, GraphNode<UserNodeId>>();
    nodes.map((on) => oldMap.set(on.id, on));

    const newNodes = users.map((u) => {
        const newSize = sizes.get(u) || 100;
        const topicData = similarity.clusters.get(u);
        const newColour = topicData ? colourLabel(topicData?.label || '') : '#5f7377';

        const old = oldMap.get(u);
        if (old) {
            if (old.size === newSize && old.data?.colour === newColour) {
                return old;
            } else {
                return {
                    ...old,
                    size: newSize,
                    data: {
                        topics: topicData || [],
                        colour: newColour,
                        label: topicData?.label || false,
                    },
                };
            }
        } else {
            const profile = profiler.getUserProfile(u);
            const p = profile.image ? profiler.content.getContentMetadata(profile.image)?.point : undefined;

            return {
                id: u,
                x: p ? p[0] * 2000 - 1000 : undefined,
                y: p ? p[1] * 2000 - 1000 : undefined,
                label: profiler.getUserName(u),
                size: newSize,
                strength: similarity.similar.get(u)?.length || 0,
                data: {
                    topics: topicData || [],
                    colour: newColour,
                    label: topicData?.label || false,
                },
            };
        }
    });
    return newNodes;
}
