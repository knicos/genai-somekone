import { useEffect, useReducer, useState } from 'react';
import style from './style.module.css';
import RecommendationsTable from '@genaism/common/components/RecommendationsTable/RecommendationsTable';
import { configuration } from '@genaism/common/state/configState';
import { useAtomValue } from 'jotai';
import RecomWizard from '@genaism/common/components/RecommendationsWizard/RecomWizard';
import ImageGrid from '@genaism/common/components/ImageGrid/ImageGrid';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { Button } from '@genai-fi/base';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import AppsIcon from '@mui/icons-material/Apps';
import { IconMenuItem, Spacer, IconMenuInline } from '@genaism/common/components/IconMenu';
import RecommendationsHeatmap from '../../visualisations/RecommendationsHeatmap/RecommendationsHeatmap';
import { ContentNodeId, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useRecommendations } from '@genaism/hooks/recommender';
import { useProfilerService } from '@genaism/hooks/services';
import InvertColorsIcon from '@mui/icons-material/InvertColors';

interface Props {
    id?: UserNodeId;
    generate?: boolean;
    noWizard?: boolean;
}

export default function RecommendationsProfile({ id, generate, noWizard }: Props) {
    const { t } = useTranslation();
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const appConfig = useAtomValue(configuration(aid));
    const { recommendations, more } = useRecommendations(9, id, appConfig?.recommendations);
    const [selected, setSelected] = useState<ContentNodeId | undefined>();
    const [wizard, setWizard] = useState(false);
    const [viewMode, setViewMode] = useState<'grid' | 'heat'>('grid');
    const [heatCount, refreshHeat] = useReducer((v) => v + 1, 0);
    const [invert, setInvert] = useState(false);

    const recomNodes: WeightedNode<ContentNodeId>[] = recommendations.map((r) => ({
        id: r.contentId,
        weight: Math.max(r.score, 0.01),
    }));

    useEffect(() => {
        if (generate) more();
    }, [generate, more]);

    const selectedRecom = selected && recommendations.find((p) => p.contentId === selected);

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
                {!appConfig.hideRecommendationMenu && (
                    <IconMenuInline>
                        {appConfig.showRecommendationWizard && !noWizard && (
                            <>
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
                            </>
                        )}

                        <IconMenuItem
                            tooltip={t('recommendations.labels.imageGrid')}
                            selected={viewMode === 'grid'}
                        >
                            <IconButton
                                color="inherit"
                                onClick={() => setViewMode('grid')}
                                aria-label={t('recommendations.aria.imageGrid')}
                            >
                                <AppsIcon />
                            </IconButton>
                        </IconMenuItem>
                        <IconMenuItem
                            tooltip={t('recommendations.labels.heatmap')}
                            selected={viewMode === 'heat'}
                        >
                            <IconButton
                                color="inherit"
                                onClick={() => setViewMode('heat')}
                                aria-label={t('recommendations.aria.heatmap')}
                                data-testid="heatmap-button"
                            >
                                <LocalFireDepartmentIcon />
                            </IconButton>
                        </IconMenuItem>
                        <Spacer />
                        <IconMenuItem
                            tooltip={t('recommendations.actions.invert')}
                            selected={invert}
                        >
                            <IconButton
                                color="inherit"
                                disabled={viewMode !== 'heat'}
                                onClick={() => {
                                    if (viewMode === 'heat') {
                                        setInvert((old) => !old);
                                    }
                                }}
                                aria-label={t('recommendations.aria.invert')}
                            >
                                <InvertColorsIcon />
                            </IconButton>
                        </IconMenuItem>
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
                    </IconMenuInline>
                )}
                {viewMode === 'heat' && (
                    <>
                        <RecommendationsHeatmap
                            user={aid}
                            dimensions={25}
                            key={`heat-${heatCount}`}
                            invert={invert}
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
                            onSelect={(id) => setSelected((old) => (old === id ? undefined : id))}
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
                                hideCandidate={appConfig.hideCandidateOrigin}
                                hideExplain={appConfig.hideExplainedScores}
                            />
                        )}
                    </>
                )}
                <div style={{ flexGrow: 5, flexShrink: 1 }} />
            </div>
        </div>
    );
}
