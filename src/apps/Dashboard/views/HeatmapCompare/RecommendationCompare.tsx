import { ContentNodeId, UserNodeId } from '@genai-fi/recom';
import style from './style.module.css';
import MapService from '@genaism/services/map/MapService';
import RecommendationsHeatmap from '@genaism/common/visualisations/RecommendationsHeatmap/RecommendationsHeatmap';

interface Props {
    users: UserNodeId[];
    mapService?: MapService;
    factor: number;
    dim: number;
    imageSet?: ContentNodeId[];
}

export default function RecommendationCompare({ users, mapService, factor, dim, imageSet }: Props) {
    return (
        <div className={style[`grid${users.length}`]}>
            {users.map((user) => (
                <div
                    key={user}
                    className={style.heatCard}
                >
                    <RecommendationsHeatmap
                        dimensions={dim}
                        user={user}
                        showName
                        deviationFactor={factor}
                        mapService={mapService}
                        imageSet={imageSet}
                    />
                </div>
            ))}
        </div>
    );
}
