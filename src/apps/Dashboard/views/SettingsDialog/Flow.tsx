import { Checkbox, FormControlLabel } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { appConfiguration } from '@genaism/common/state/configState';

export default function FlowSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);

    return (
        <div className={style.column}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.blackboxWorkflow || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, blackboxWorkflow: checked }))}
                    />
                }
                label={t('dashboard.labels.blackboxFlow')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.hideFeedInWorkflow || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, hideFeedInWorkflow: checked }))}
                    />
                }
                label={t('dashboard.labels.hideFeedInWorkflow')}
            />
        </div>
    );
}
