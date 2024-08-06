import { useEffect, useReducer, useState } from 'react';
import style from './style.module.css';
import RecommendationsTable from '../RecommendationsTable/RecommendationsTable';
import { configuration } from '@genaism/state/settingsState';
import { useRecoilValue } from 'recoil';
import RecomWizard from '../RecommendationsWizard/RecomWizard';
import ImageGrid from '../ImageGrid/ImageGrid';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '@knicos/genai-base';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AppsIcon from '@mui/icons-material/Apps';
import IconMenuItem from '../IconMenu/Item';
import Spacer from '../IconMenu/Spacer';
import { IconMenuContext } from '../IconMenu/context';
import RecommendationsHeatmap from '../RecommendationsHeatmap/RecommendationsHeatmap';
import { ContentNodeId, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useRecommendations } from '@genaism/hooks/recommender';
import { useProfilerService } from '@genaism/hooks/services';

interface Props {
    id?: UserNodeId;
    generate?: boolean;
    noWizard?: boolean;
}

export default function RecommendationsProfile({ id, generate, noWizard }: Props) {
    const { t } = useTranslation();
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const appConfig = useRecoilValue(configuration(aid));
    const { recommendations, more } = useRecommendations(9, id, appConfig?.recommendations);
    const [selected, setSelected] = useState(-1);
    const [wizard, setWizard] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'heat'>('grid');
    const [heatCount, refreshHeat] = useReducer((v) => v + 1, 0);

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
                    <IconMenuContext.Provider value="top">
                        <Button
                            onClick={() => setWizard(true)}
                            variant="contained"
                            color="secondary"
                            startIcon={<DesignServicesIcon />}
                            data-testid="start-recom-wizard"
                            sx={{ marginLeft: '1rem' }}
                            disabled={wizard}
                        >
                            {t('recommendations.actions.change')}
                        </Button>
                        <div style={{ flexGrow: 1 }} />
                        <Spacer />
                        <IconMenuItem tooltip={t('recommendations.labels.imageGrid')}>
                            <IconButton
                                color={viewMode === 'grid' ? 'secondary' : 'inherit'}
                                onClick={() => setViewMode('grid')}
                                aria-label={t('recommendations.aria.imageGrid')}
                            >
                                <AppsIcon />
                            </IconButton>
                        </IconMenuItem>
                        <IconMenuItem tooltip={t('recommendations.labels.heatmap')}>
                            <IconButton
                                color={viewMode === 'heat' ? 'secondary' : 'inherit'}
                                onClick={() => setViewMode('heat')}
                                aria-label={t('recommendations.aria.heatmap')}
                                data-testid="heatmap-button"
                            >
                                <LocalFireDepartmentIcon />
                            </IconButton>
                        </IconMenuItem>
                        <Spacer />
                        <IconMenuItem tooltip={t('recommendations.actions.refresh')}>
                            <IconButton
                                color="inherit"
                                onClick={() => {
                                    if (viewMode === 'grid') {
                                        more();
                                    } else {
                                        refreshHeat();
                                    }
                                }}
                                aria-label={t('recommendations.aria.refresh')}
                            >
                                <RefreshIcon />
                            </IconButton>
                        </IconMenuItem>
                    </IconMenuContext.Provider>
                </div>
                {viewMode === 'heat' && (
                    <>
                        <RecommendationsHeatmap
                            user={aid}
                            dimensions={25}
                            key={`heat-${heatCount}`}
                        />
                        {
                            <div className={style.infoBar}>
                                <InfoIcon />
                                <span>{t('recommendations.descriptions.heatHint')}</span>
                            </div>
                        }
                    </>
                )}
                {viewMode === 'grid' && (
                    <>
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
                    </>
                )}
                <div style={{ flexGrow: 5, flexShrink: 1 }} />
            </div>
        </div>
    );
}
