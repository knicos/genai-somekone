import { configuration } from '@genaism/common/state/configState';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import Heatmap from '../Heatmap/Heatmap';
import { ContentNodeId, GraphService, uniqueSubset, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useProfilerService } from '@genaism/hooks/services';

interface Props {
    user: UserNodeId;
    dimensions?: number;
    showName?: boolean;
    invert?: boolean;
}

export function uniformUniqueSubset<T, V extends string | number>(
    nodes: T[],
    count: number,
    valueFn: (n: T) => V,
    exclude?: Set<V>
): T[] {
    const unique = uniqueSubset(nodes, valueFn);
    if (unique.length <= count) return unique;
    const seen = exclude || new Set<V>();
    const results: T[] = [];

    // It might be faster to remove candidates than to retry.
    while (results.length < count) {
        const ix = Math.floor(Math.random() * unique.length);
        const v = valueFn(unique[ix]);
        if (!seen.has(v)) {
            seen.add(v);
            results.push(unique[ix]);
        }
    }

    return results;
}

function heatmapImageSet(graph: GraphService, count: number, existing: ContentNodeId[]): ContentNodeId[] {
    const contents = graph.getNodesByType('content');
    return uniformUniqueSubset(contents, count, (v) => v, new Set(existing));
}

export default function EngagementHeatmap({ user, dimensions, showName, invert }: Props) {
    const config = useRecoilValue(configuration(user));
    const images = useRef<ContentNodeId[]>();
    const [heats, setHeats] = useState<WeightedNode<ContentNodeId>[]>();
    const [loading, setLoading] = useState(false);
    const profile = useUserProfile(user);
    const profiler = useProfilerService();

    const adim = dimensions || Math.floor(Math.sqrt(profiler.content.getAllContent().length));

    useEffect(() => {
        setLoading(true);
        const userEngagements = profiler.getEngagedContent(user);

        if (!images.current) {
            images.current = [
                ...userEngagements.map((u) => u.id),
                ...heatmapImageSet(
                    profiler.graph,
                    adim * adim - userEngagements.length,
                    userEngagements.map((u) => u.id)
                ),
            ];
        }

        const engagementMap = new Map<ContentNodeId, number>();
        userEngagements.forEach((engagement) => {
            engagementMap.set(engagement.id, engagement.weight);
        });
        if (images.current) {
            const engagedImages = images.current.map((img) => ({ id: img, weight: engagementMap.get(img) || 0 }));
            engagedImages.sort((a, b) => b.weight - a.weight);
            setHeats(engagedImages);
        }
        setLoading(false);
    }, [adim, user, config, profile, profiler]);

    return (
        <Heatmap
            data={heats || []}
            busy={loading}
            dimensions={dimensions}
            label={showName ? profile.name : undefined}
            invert={invert}
        />
    );
}
