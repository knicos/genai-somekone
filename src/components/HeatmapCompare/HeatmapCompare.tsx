import RecommendationsHeatmap from '../RecommendationsHeatmap/RecommendationsHeatmap';
import HeatmapMenu from './Menu';
import { useReducer, useState } from 'react';
import UserDialog from '../UserListing/UserDialog';
import { UserNodeId } from '@knicos/genai-recom';
import style from './style.module.css';

export default function HeatmapCompare() {
    const [openUserList, setOpenUserList] = useState(true);
    const [users, setUser] = useState<UserNodeId[]>([]);
    const [count, refresh] = useReducer((old) => old + 1, 0);
    const [invert, setInvert] = useState(false);

    return (
        <>
            <div
                className={style[`grid${users.length}`]}
                key={`g${count}`}
            >
                {users.map((user) => (
                    <RecommendationsHeatmap
                        key={user}
                        dimensions={25}
                        user={user}
                        showName
                        invert={invert}
                    />
                ))}
            </div>
            <UserDialog
                open={openUserList}
                onClose={() => setOpenUserList(false)}
                onSelect={setUser}
                preSelected={users}
                multiple={4}
            />
            <HeatmapMenu
                onOpenUserList={() => setOpenUserList(true)}
                onRefresh={refresh}
                onInvert={() => setInvert((o) => !o)}
                inverted={invert}
            />
        </>
    );
}
