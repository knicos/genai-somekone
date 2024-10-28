import Feed from '@genaism/views/Feed/Feed';
import { appConfiguration } from '@genaism/state/settingsState';
import AppNavigation from '@genaism/pages/Genagram/AppNavigation';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

export default function MenuSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);

    return (
        <div className={style.settingsContainer}>
            <div className={style.feedView}>
                <Feed alwaysActive />
                {!config.hideActionsButton && <AppNavigation code="x" />}
            </div>
            <div className={style.column}>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideActionsButton || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideActionsButton: checked }))}
                        />
                    }
                    label={t('settings.app.hideFeedMenu')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideDataView || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideDataView: checked }))}
                        />
                    }
                    label={t('settings.app.hideDataView')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideProfileView || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideProfileView: checked }))}
                        />
                    }
                    label={t('settings.app.hideProfileView')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideRecommendationsView || false}
                            onChange={(_, checked) =>
                                setConfig((old) => ({ ...old, hideRecommendationsView: checked }))
                            }
                        />
                    }
                    label={t('settings.app.hideRecommendationsView')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hidePostContent || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hidePostContent: checked }))}
                        />
                    }
                    label={t('settings.app.hidePostContent')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideOwnProfile || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideOwnProfile: checked }))}
                        />
                    }
                    label={t('settings.app.hideOwnProfile')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.hideShareProfile || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, hideShareProfile: checked }))}
                        />
                    }
                    label={t('settings.app.hideSharing')}
                />
            </div>
        </div>
    );
}
