import { useEffect, useState } from 'react';
import style from './style.module.css';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';
import RecommendationsTable from '../RecommendationsTable/RecommendationsTable';
import { configuration } from '@genaism/state/settingsState';
import { useRecoilValue } from 'recoil';
import RecomWizard from './RecomWizard';
import ImageGrid from './ImageGrid';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '@knicos/genai-base';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { getCurrentUser } from '@genaism/services/profiler/state';

interface Props {
    id?: UserNodeId;
    generate?: boolean;
    noWizard?: boolean;
}

export default function RecommendationsProfile({ id, generate, noWizard }: Props) {
    const { t } = useTranslation();
    const aid = id || getCurrentUser();
    const appConfig = useRecoilValue(configuration(aid));
    const { recommendations, more } = useRecommendations(9, id, appConfig?.recommendations);
    const [selected, setSelected] = useState(-1);
    const [wizard, setWizard] = useState(false);

    const recomNodes: WeightedNode<ContentNodeId>[] = recommendations.map((r) => ({
        id: r.contentId,
        weight: Math.max(r.score, 0.01),
    }));

    useEffect(() => {
        if (generate) more();
    }, [generate, more]);

    const selectedRecom = selected >= 0 && recommendations[selected];

    return (
        <div className={style.outerContainer}>
            <div
                className={style.container}
                tabIndex={0}
            >
                {appConfig.showRecommendationWizard && !noWizard && (
                    <RecomWizard
                        active={wizard}
                        onClose={() => setWizard(false)}
                        id={aid}
                    />
                )}
                <div className={style.buttonBar}>
                    <IconButton
                        color="inherit"
                        onClick={more}
                        aria-label={t('recommendations.aria.refresh')}
                    >
                        <RefreshIcon />
                    </IconButton>
                    <div style={{ flexGrow: 1 }} />
                    <Button
                        onClick={() => setWizard(true)}
                        variant="contained"
                        color="secondary"
                        startIcon={<DesignServicesIcon />}
                        data-testid="start-recom-wizard"
                        sx={{ marginRight: '1rem' }}
                        disabled={wizard}
                    >
                        {t('recommendations.actions.change')}
                    </Button>
                </div>
                <ImageGrid
                    selected={selected}
                    onSelect={(ix: number) => setSelected((old) => (old === ix ? -1 : ix))}
                    images={recomNodes.map((n) => n.id)}
                />
                {!selectedRecom && (
                    <div className={style.infoBar}>
                        <InfoIcon />
                        <span>{t('recommendations.descriptions.selectHint')}</span>
                    </div>
                )}
                {selectedRecom && (
                    <RecommendationsTable
                        userId={aid}
                        recommendation={selectedRecom}
                    />
                )}
                <div style={{ flexGrow: 5, flexShrink: 1 }} />
            </div>
        </div>
    );
}
