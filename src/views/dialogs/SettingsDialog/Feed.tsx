import { Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { appConfiguration } from '@genaism/state/settingsState';

export default function FeedSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);

    return (
        <div className={style.column}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.disableFeedApp || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, disableFeedApp: checked }))}
                    />
                }
                label={t('dashboard.labels.disableFeedApp')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.hideActionsButton || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, hideActionsButton: checked }))}
                    />
                }
                label={t('dashboard.labels.hideFeedMenu')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.hideDataView || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, hideDataView: checked }))}
                    />
                }
                label={t('dashboard.labels.hideDataView')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.hideProfileView || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, hideProfileView: checked }))}
                    />
                }
                label={t('dashboard.labels.hideProfileView')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.hideRecommendationsView || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, hideRecommendationsView: checked }))}
                    />
                }
                label={t('dashboard.labels.hideRecommendationsView')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.showTopicLabels || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, showTopicLabels: checked }))}
                    />
                }
                label={t('dashboard.labels.showFeedImageLabels')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.alwaysActive || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, alwaysActive: checked }))}
                    />
                }
                label={t('dashboard.labels.alwaysActive')}
            />
        </div>
    );
}
