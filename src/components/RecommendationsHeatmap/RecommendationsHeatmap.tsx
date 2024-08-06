import { configuration } from '@genaism/state/settingsState';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { heatmapImageSet, heatmapScores } from '../RecommendationsHeatmap/algorithm';
import Heatmap from '../Heatmap/Heatmap';
import { ContentNodeId, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useRecommenderService } from '@genaism/hooks/services';

interface Props {
    user: UserNodeId;
    dimensions: number;
}

export default function RecommendationsHeatmap({ user, dimensions }: Props) {
    const config = useRecoilValue(configuration(user));
    const images = useRef<ContentNodeId[]>();
    const [heats, setHeats] = useState<WeightedNode<ContentNodeId>[]>();
    const [loading, setLoading] = useState(false);
    const profile = useUserProfile(user);
    const recommender = useRecommenderService();

    useEffect(() => {
        setLoading(true);
        if (!images.current) {
            images.current = heatmapImageSet(recommender.graph, dimensions);
        }

        heatmapScores(recommender, images.current, user, profile, config).then((scored) => {
            setHeats(scored);
            setLoading(false);
        });
    }, [dimensions, user, config, profile, recommender]);

    return (
        <Heatmap
            data={heats || []}
            busy={loading}
            dimensions={dimensions}
        />
    );
}
