import RecommendationsHeatmap from '@genaism/common/visualisations/RecommendationsHeatmap/RecommendationsHeatmap';
import HeatmapMenu from './Menu';
import { useEffect, useReducer, useState } from 'react';
import UserDialog from '@genaism/common/views/UserListing/UserDialog';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import ContentHeatmap from '../../visualisations/ContentHeatmap/ContentHeatmap';
import EngagementHeatmap from '@genaism/common/visualisations/EngagementHeatmap/EngagementHeaptmap';
import { useRecoilState, useRecoilValue } from 'recoil';
import { heatmapAutoUsers, heatmapMode } from '../../state/settingsState';
import { useProfilerService } from '@genaism/hooks/services';
import disimilarUsers from '../../../../util/autoUsers';

export default function HeatmapCompare() {
    const [openUserList, setOpenUserList] = useState(false);
    const [users, setUser] = useState<UserNodeId[]>([]);
    const [count, refresh] = useReducer((old) => old + 1, 0);
    const [mode, setMode] = useRecoilState(heatmapMode);
    const [factor, setFactor] = useState(1);
    const autoUsers = useRecoilValue(heatmapAutoUsers);
    const profiler = useProfilerService();

    useEffect(() => {
        if ((mode === 'engagement' || mode === 'recommendation') && users.length === 0 && autoUsers === 0) {
            setOpenUserList(true);
        }
    }, [users, mode, autoUsers]);

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
                <div
                    className={style[`grid${users.length}`]}
                    key={`g${count}`}
                >
                    {users.map((user) => (
                        <div
                            key={user}
                            className={style.heatCard}
                        >
                            <RecommendationsHeatmap
                                dimensions={0}
                                user={user}
                                showName
                                deviationFactor={factor}
                            />
                        </div>
                    ))}
                </div>
            )}
            {mode === 'engagement' && (
                <div
                    className={style[`grid${users.length}`]}
                    key={`g${count}`}
                >
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
                            />
                        </div>
                    ))}
                </div>
            )}
            {mode === 'global' && (
                <div
                    className={style.grid1}
                    key={`g${count}`}
                >
                    <div className={style.heatCard}>
                        <ContentHeatmap
                            dimensions={0}
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
