import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import MapService from '@genaism/services/map/MapService';
import EngagementHeatmap from '@genaism/common/visualisations/EngagementHeatmap/EngagementHeaptmap';

interface Props {
    users: UserNodeId[];
    mapService?: MapService;
    factor: number;
}

export default function EngagementCompare({ users, mapService, factor }: Props) {
    return (
        <div className={style[`grid${users.length}`]}>
            {users.map((user) => (
                <div
                    key={user}
                    className={style.heatCard}
                >
                    <EngagementHeatmap
                        dimensions={0}
                        user={user}
                        showName
                        deviationFactor={factor}
                        mapService={mapService}
                    />
                </div>
            ))}
        </div>
    );
}
