import Feed from '@genaism/views/Feed/Feed';
import { appConfiguration } from '@genaism/state/settingsState';
import AppNavigation from '@genaism/pages/Genagram/AppNavigation';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

export default function FeedSettings() {
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
                            checked={config?.disableComments || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, disableComments: checked }))}
                        />
                    }
                    label={t('settings.app.disableComments')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.disableLiking || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, disableLiking: checked }))}
                        />
                    }
                    label={t('settings.app.disableLiking')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.disableFollowing || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, disableFollowing: checked }))}
                        />
                    }
                    label={t('settings.app.disableFollowing')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.disableSharing || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, disableSharing: checked }))}
                        />
                    }
                    label={t('settings.app.disableSharing')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={config?.showTopicLabels || false}
                            onChange={(_, checked) => setConfig((old) => ({ ...old, showTopicLabels: checked }))}
                        />
                    }
                    label={t('settings.app.showFeedImageLabels')}
                />
            </div>
        </div>
    );
}
