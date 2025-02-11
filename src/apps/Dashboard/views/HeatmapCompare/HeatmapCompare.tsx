import RecommendationsHeatmap from '@genaism/common/visualisations/RecommendationsHeatmap/RecommendationsHeatmap';
import HeatmapMenu, { HeatmapMode } from './Menu';
import { useEffect, useReducer, useState } from 'react';
import UserDialog from '@genaism/common/views/UserListing/UserDialog';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';
import ContentHeatmap from '../../visualisations/ContentHeatmap/ContentHeatmap';
import EngagementHeatmap from '@genaism/common/visualisations/EngagementHeatmap/EngagementHeaptmap';

export default function HeatmapCompare() {
    const [openUserList, setOpenUserList] = useState(false);
    const [users, setUser] = useState<UserNodeId[]>([]);
    const [count, refresh] = useReducer((old) => old + 1, 0);
    const [invert, setInvert] = useState(false);
    const [mode, setMode] = useState<HeatmapMode>('global');

    useEffect(() => {
        if ((mode === 'engagement' || mode === 'recommendation') && users.length === 0) {
            setOpenUserList(true);
        }
    }, [users, mode]);

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
                                invert={invert}
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
                                invert={invert}
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
                            invert={invert}
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
                onInvert={() => setInvert((o) => !o)}
                inverted={invert}
            />
        </>
    );
}
