import HeatmapMenu from './Menu';
import { useEffect, useReducer, useRef, useState } from 'react';
import UserDialog from '@genaism/common/views/UserListing/UserDialog';
import { ContentNodeId, UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import ContentHeatmap from '../../visualisations/ContentHeatmap/ContentHeatmap';
import { useAtom, useAtomValue } from 'jotai';
import { heatmapAutoUsers, heatmapDimension, heatmapMode } from '../../state/settingsState';
import { useServices } from '@genaism/hooks/services';
import disimilarUsers from '../../../../util/autoUsers';
import { heatmapImageSet } from '@genaism/common/visualisations/RecommendationsHeatmap/algorithm';
import MapService from '@genaism/services/map/MapService';
import RecommendationCompare from './RecommendationCompare';
import EngagementCompare from './EngagementCompare';

export default function HeatmapCompare() {
    const [openUserList, setOpenUserList] = useState(false);
    const [users, setUser] = useState<UserNodeId[]>([]);
    const [count, refresh] = useReducer((old) => old + 1, 0);
    const [mode, setMode] = useAtom(heatmapMode);
    const [factor, setFactor] = useState(1);
    const autoUsers = useAtomValue(heatmapAutoUsers);
    const { profiler, content } = useServices();
    const imageSet = useRef<ContentNodeId[]>([]);
    const [mapper, setMapper] = useState<MapService>();
    const dim = useAtomValue(heatmapDimension);

    const adim = dim || Math.floor(Math.sqrt(content.getAllContent().length));

    if (!imageSet.current || imageSet.current.length < adim * adim - adim) {
        imageSet.current = heatmapImageSet(profiler.graph);
    }

    useEffect(() => {
        if ((mode === 'engagement' || mode === 'recommendation') && users.length === 0 && autoUsers === 0) {
            setOpenUserList(true);
        }
    }, [users, mode, autoUsers]);

    useEffect(() => {
        setMapper(new MapService(content, { dataSetSize: users.length, dim: adim }));
    }, [content, users, count, mode, adim]);

    useEffect(() => {
        if (autoUsers > 0) {
            setUser(disimilarUsers(profiler, autoUsers));
        } else {
            setUser([]);
        }
    }, [autoUsers, profiler]);

    return (
        <>
            {mode === 'recommendation' && (
                <RecommendationCompare
                    key={`g${count}`}
                    mapService={mapper}
                    factor={factor}
                    users={users}
                    dim={dim}
                    imageSet={imageSet.current}
                />
            )}
            {mode === 'engagement' && (
                <EngagementCompare
                    key={`g${count}`}
                    mapService={mapper}
                    factor={factor}
                    users={users}
                    dim={dim}
                    imageSet={imageSet.current}
                />
            )}
            {mode === 'global' && (
                <div
                    className={style.grid1}
                    key={`g${count}`}
                >
                    <div className={style.heatCard}>
                        <ContentHeatmap
                            dimensions={dim}
                            deviationFactor={factor}
                        />
                    </div>
                </div>
            )}
            <UserDialog
                open={openUserList}
                onClose={() => setOpenUserList(false)}
                onSelect={setUser}
                preSelected={users}
                multiple={4}
            />
            <HeatmapMenu
                mode={mode}
                onMode={setMode}
                onOpenUserList={() => setOpenUserList(true)}
                onRefresh={refresh}
                factor={factor}
                onFactor={setFactor}
            />
        </>
    );
}
