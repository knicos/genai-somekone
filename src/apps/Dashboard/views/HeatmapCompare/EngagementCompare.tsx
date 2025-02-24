import { ContentNodeId, UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import MapService from '@genaism/services/map/MapService';
import EngagementHeatmap from '@genaism/common/visualisations/EngagementHeatmap/EngagementHeaptmap';

interface Props {
    users: UserNodeId[];
    mapService?: MapService;
    factor: number;
    dim: number;
    imageSet?: ContentNodeId[];
}

export default function EngagementCompare({ users, mapService, factor, dim, imageSet }: Props) {
    return (
        <div className={style[`grid${users.length}`]}>
            {users.map((user) => (
                <div
                    key={user}
                    className={style.heatCard}
                >
                    <EngagementHeatmap
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
