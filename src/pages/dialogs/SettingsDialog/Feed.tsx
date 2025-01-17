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
                        checked={config?.alwaysActive || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, alwaysActive: checked }))}
                    />
                }
                label={t('dashboard.labels.alwaysActive')}
            />
        </div>
    );
}
