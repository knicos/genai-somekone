import { useEffect, useState } from 'react';
import style from './style.module.css';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';
import RecommendationsTable from '../RecommendationsTable/RecommendationsTable';
import { appConfiguration } from '@genaism/state/settingsState';
import { useRecoilValue } from 'recoil';
import RecomWizard from './RecomWizard';
import ImageGrid from './ImageGrid';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';

interface Props {
    id?: UserNodeId;
    generate?: boolean;
    noWizard?: boolean;
}

export default function RecommendationsProfile({ id, generate, noWizard }: Props) {
    const { t } = useTranslation();
    const appConfig = useRecoilValue(appConfiguration);
    const { recommendations, more } = useRecommendations(9, id, appConfig?.recommendations);
    const [selected, setSelected] = useState(0);

    const recomNodes: WeightedNode<ContentNodeId>[] = recommendations.map((r) => ({
        id: r.contentId,
        weight: Math.max(r.score, 0.01),
    }));

    useEffect(() => {
        if (generate) more();
    }, [generate, more]);

    const selectedRecom = recommendations[selected];

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                {appConfig.showRecommendationWizard && appConfig.experimental && !noWizard && <RecomWizard />}
                <div className={style.buttonBar}>
                    <IconButton
                        color="inherit"
                        onClick={more}
                        aria-label={t('recommendations.aria.refresh')}
                    >
                        <RefreshIcon />
                    </IconButton>
                </div>
                <ImageGrid
                    selected={selected}
                    onSelect={setSelected}
                    images={recomNodes.map((n) => n.id)}
                />
                <div className={style.infoBar}>
                    <InfoIcon />
                    <span>{t('recommendations.descriptions.selectHint')}</span>
                </div>
                <RecommendationsTable recommendations={selectedRecom ? [selectedRecom] : []} />
            </div>
        </div>
    );
}
