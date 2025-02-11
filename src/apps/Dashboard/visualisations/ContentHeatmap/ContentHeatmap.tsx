import { useEffect, useRef, useState } from 'react';
import { heatmapImageSet } from '@genaism/common/visualisations/RecommendationsHeatmap/algorithm';
import Heatmap from '../../../../common/visualisations/Heatmap/Heatmap';
import { ContentNodeId, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

interface Props {
    dimensions: number;
    invert?: boolean;
}

export default function ContentHeatmap({ dimensions, invert }: Props) {
    const images = useRef<ContentNodeId[]>();
    const [heats, setHeats] = useState<WeightedNode<ContentNodeId>[]>();
    const [loading, setLoading] = useState(false);
    const contentSvc = useContentService();

    useEffect(() => {
        setLoading(true);
        if (!images.current) {
            images.current = heatmapImageSet(contentSvc.graph, dimensions);
        }
        if (images.current) {
            const weightedImages = images.current.map((img) => ({
                id: img,
                weight: contentSvc.getContentEngagement(img),
            }));
            weightedImages.sort((a, b) => b.weight - a.weight);
            setHeats(weightedImages);
        }
        setLoading(false);
    }, [dimensions, contentSvc]);

    return (
        <Heatmap
            data={heats || []}
            busy={loading}
            dimensions={dimensions}
            invert={invert}
        />
    );
}
