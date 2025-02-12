import { configuration } from '@genaism/common/state/configState';
import { useEffect, useRef, useState } from 'react';
import { useRecoilValue } from 'recoil';
import { heatmapImageSet, heatmapScores } from './algorithm';
import Heatmap from '../Heatmap/Heatmap';
import { ContentNodeId, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useRecommenderService } from '@genaism/hooks/services';

interface Props {
    user: UserNodeId;
    dimensions: number;
    showName?: boolean;
    invert?: boolean;
    deviationFactor?: number;
}

export default function RecommendationsHeatmap({ user, dimensions, showName, invert, deviationFactor }: Props) {
    const config = useRecoilValue(configuration(user));
    const images = useRef<ContentNodeId[]>();
    const [heats, setHeats] = useState<WeightedNode<ContentNodeId>[]>();
    const [loading, setLoading] = useState(false);
    const profile = useUserProfile(user);
    const recommender = useRecommenderService();

    useEffect(() => {
        if (!images.current || images.current.length === 0) {
            setLoading(true);
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
            label={showName ? profile.name : undefined}
            invert={invert}
            deviationFactor={deviationFactor}
        />
    );
}
