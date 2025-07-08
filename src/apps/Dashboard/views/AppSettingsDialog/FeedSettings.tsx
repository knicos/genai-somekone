import Feed from '@genaism/common/views/Feed/Feed';
import { appConfiguration } from '@genaism/common/state/configState';
import AppNavigation from '@genaism/apps/Somegram/AppNavigation';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useAtom } from 'jotai';
import style from './style.module.css';
import { I18nextProvider, useTranslation } from 'react-i18next';
import i18n from '@genaism/i18n';

export default function FeedSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useAtom(appConfiguration);

    return (
        <div className={style.settingsContainer}>
            <I18nextProvider
                i18n={i18n}
                defaultNS="common"
            >
                <div className={style.feedView}>
                    <Feed alwaysActive />
                    {!config.hideActionsButton && <AppNavigation code="x" />}
                </div>
            </I18nextProvider>
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
