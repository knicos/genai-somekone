import style from './style.module.css';
import FeedPanel from '@genaism/visualisations/SocialGraph/FeedPanel';
import DataPanel from '@genaism/visualisations/SocialGraph/DataPanel';
import ProfilePanel from '@genaism/visualisations/SocialGraph/ProfilePanel';
import RecommendationsPanel from '@genaism/visualisations/SocialGraph/RecommendationsPanel';
import GridMenu from './GridMenu';
import { UserNodeId } from '@knicos/genai-recom';
import UserGridItem from './UserGridItem';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuSelectedUser } from '@genaism/state/menuState';
import { settingClusterColouring } from '@genaism/state/settingsState';
import { colourLabel } from '@genaism/visualisations/SocialGraph/colourise';
import colours from '@knicos/genai-base/css/colours.module.css';
import { useServices } from '@genaism/hooks/services';
import { useEffect, useMemo } from 'react';
import { useSimilarityData } from '@genaism/hooks/similarity';
import Loading from '@genaism/components/Loading/Loading';
import { useTranslation } from 'react-i18next';

interface Props {
    users?: UserNodeId[];
}

export default function UserGrid({ users }: Props) {
    const { t } = useTranslation();
    const { profiler, similarity } = useServices();
    const similar = useSimilarityData();
    const fusers = useMemo(() => similar.users.filter((u) => u !== profiler.getCurrentUser()), [similar, profiler]);
    const ausers = users ? users : fusers;
    const clustering = useRecoilValue(settingClusterColouring);
    const setSelectedUser = useSetRecoilState(menuSelectedUser);

    useEffect(() => {
        similarity.setK(clustering);
    }, [clustering, similarity]);

    const COLS = Math.ceil(Math.sqrt(ausers.length)) + 1;

    let sortedUsers: UserNodeId[] = [];
    if (clustering > 0) {
        const clustermap = new Map<string, UserNodeId[]>();
        ausers.forEach((user) => {
            const cluster = similar.clusters.get(user)?.label || 'nocluster';
            const bucket = clustermap.get(cluster) || [];
            bucket.push(user);
            clustermap.set(cluster, bucket);
        });
        const arrayClusters = Array.from(clustermap);
        arrayClusters.sort((a, b) => b[0].localeCompare(a[0]));
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
                {sortedUsers.length === 0 && (
                    <Loading
                        loading={true}
                        message={t('dashboard.messages.waitingPeople')}
                    />
                )}
                {sortedUsers.map((user) => {
                    const cluster = similar.clusters.get(user)?.label;
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
