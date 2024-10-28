import style from './style.module.css';
import FeedPanel from '@genaism/visualisations/SocialGraph/FeedPanel';
import DataPanel from '@genaism/visualisations/SocialGraph/DataPanel';
import ProfilePanel from '@genaism/visualisations/SocialGraph/ProfilePanel';
import RecommendationsPanel from '@genaism/visualisations/SocialGraph/RecommendationsPanel';
import GridMenu from './GridMenu';
import { UserNodeId } from '@knicos/genai-recom';
import { useNodeType } from '@genaism/hooks/graph';
import UserGridItem from './UserGridItem';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuSelectedUser } from '@genaism/state/menuState';
import { useAllSimilarUsers } from '@genaism/visualisations/SocialGraph/similarity';
import { settingClusterColouring } from '@genaism/state/settingsState';
import { colourLabel } from '@genaism/visualisations/SocialGraph/colourise';
import colours from '@knicos/genai-base/css/colours.module.css';
import { useProfilerService } from '@genaism/hooks/services';
import { useMemo } from 'react';

interface Props {
    users?: UserNodeId[];
}

export default function UserGrid({ users }: Props) {
    const profiler = useProfilerService();
    const allusers = useNodeType('user');
    const fusers = useMemo(() => allusers.filter((u) => u !== profiler.getCurrentUser()), [allusers, profiler]);
    const ausers = users ? users : fusers;
    const clustering = useRecoilValue(settingClusterColouring);
    const similar = useAllSimilarUsers(ausers, clustering > 0, clustering);
    const setSelectedUser = useSetRecoilState(menuSelectedUser);

    const COLS = Math.ceil(Math.sqrt(ausers.length)) + 1;

    let sortedUsers: UserNodeId[] = [];
    if (clustering > 0) {
        const clustermap = new Map<string, UserNodeId[]>();
        ausers.forEach((user) => {
            const cluster = similar.topics?.get(user)?.label || 'nocluster';
            const bucket = clustermap.get(cluster) || [];
            bucket.push(user);
            clustermap.set(cluster, bucket);
        });
        const arrayClusters = Array.from(clustermap);
        arrayClusters.sort((a, b) => b[1].length - a[1].length);
        sortedUsers = arrayClusters.reduce((s: UserNodeId[], v) => [...s, ...v[1]], []);
    } else {
        sortedUsers = ausers;
    }

    return (
        <>
            <div
                className={style.grid}
                style={{ gridTemplateColumns: `repeat(${COLS}, 1fr)` }}
                onClick={() => setSelectedUser(undefined)}
                data-testid="usergrid"
            >
                {sortedUsers.map((user) => {
                    const cluster = similar.topics?.get(user)?.label;
                    return (
                        <UserGridItem
                            id={user}
                            key={user}
                            colour={cluster ? colourLabel(cluster) : colours.primary}
                        />
                    );
                })}
            </div>
            <GridMenu />
            <FeedPanel />
            <DataPanel />
            <ProfilePanel />
            <RecommendationsPanel />
        </>
    );
}
