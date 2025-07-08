import { appConfiguration } from '@genaism/common/state/configState';
import AppNavigation from '@genaism/apps/Somegram/AppNavigation';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useAtom } from 'jotai';
import style from './style.module.css';
import { I18nextProvider, useTranslation } from 'react-i18next';
import RecommendationsProfile from '@genaism/common/views/RecommendationsProfile/RecommendationsProfile';
import i18n from '@genaism/i18n';

export default function RecomSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useAtom(appConfiguration);

    return (
        <div className={style.settingsContainer}>
            <I18nextProvider
                i18n={i18n}
                defaultNS="common"
            >
                <div className={style.feedView}>
                    <RecommendationsProfile />
                    {!config.hideActionsButton && <AppNavigation code="x" />}
                </div>
            </I18nextProvider>
            <div className={style.column}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideRecommendationMenu || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideRecommendationMenu: checked }))}
                        />
                    }
                    label={t('settings.app.hideRecommendationMenu')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.showRecommendationWizard || false}
                            onChange={(_, checked) =>
                                setConfig((old) => ({ ...old, showRecommendationWizard: checked }))
                            }
                        />
                    }
                    label={t('settings.app.showRecommendationWizard')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={config?.showRecommendationWizard === false}
                            checked={config?.showCandidateWizard || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, showCandidateWizard: checked }))}
                        />
                    }
                    label={t('settings.app.showCandidateWizard')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={config?.showRecommendationWizard === false}
                            checked={config?.showCandidateRefinementWizard || false}
                            onChange={(_, checked) =>
                                setConfig((old) => ({ ...old, showCandidateRefinementWizard: checked }))
                            }
                        />
                    }
                    label={t('settings.app.showCandidateRefinementWizard')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={config?.showRecommendationWizard === false}
                            checked={config?.showScoringWizard || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, showScoringWizard: checked }))}
                        />
                    }
                    label={t('settings.app.showScoringWizard')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            disabled={config?.showRecommendationWizard === false}
                            checked={config?.showDiversityWizard || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, showDiversityWizard: checked }))}
                        />
                    }
                    label={t('settings.app.showDiversityWizard')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideCandidateOrigin || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideCandidateOrigin: checked }))}
                        />
                    }
                    label={t('settings.app.hideCandidateOrigin')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideExplainedScores || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideExplainedScores: checked }))}
                        />
                    }
                    label={t('settings.app.hideExplainedScores')}
                />
            </div>
        </div>
    );
}
