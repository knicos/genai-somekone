import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useState } from 'react';
import style from './style.module.css';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';
import RecommendationsTable from '../RecommendationsTable/RecommendationsTable';
import { appConfiguration } from '@genaism/state/settingsState';
import { useRecoilValue } from 'recoil';

interface Props {
    id?: UserNodeId;
}

export default function RecommendationsProfile({ id }: Props) {
    const [wcSize, setWCSize] = useState(300);
    const appConfig = useRecoilValue(appConfiguration);
    const { recommendations } = useRecommendations(10, id, appConfig?.recommendations);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    const recomNodes: WeightedNode<ContentNodeId>[] = recommendations.map((r) => ({
        id: r.contentId,
        weight: r.score || 0.01,
    }));

    // console.log('Recommendations', recommendations);

    return (
        <div className={style.container}>
            <div>
                <svg
                    width="100%"
                    height="300px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <ImageCloud
                        content={recomNodes}
                        size={300}
                        onSize={doResize}
                    />
                </svg>
            </div>
            <RecommendationsTable recommendations={recommendations} />
        </div>
    );
}
