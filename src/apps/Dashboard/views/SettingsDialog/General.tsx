import { useAtom } from 'jotai';
import style from './style.module.css';
import { appConfiguration } from '@genaism/common/state/configState';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import LangSelect from '@genaism/common/components/LangSelect/LangSelect';
import { menuMainMenu, menuShowReplay } from '@genaism/apps/Dashboard/state/menuState';
import { userApp } from '../../state/settingsState';

export default function GeneralSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useAtom(appConfiguration);
    const [replay, showReplay] = useAtom(menuShowReplay);
    const [main, showMain] = useAtom(menuMainMenu);
    const [appType, setAppType] = useAtom(userApp);

    return (
        <div className={style.column}>
            <LangSelect />
            <div className={style.spacer} />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={config?.collectResearchData || false}
                        onChange={(_, checked) => setConfig((old) => ({ ...old, collectResearchData: checked }))}
                    />
                }
                label={t('dashboard.labels.collectResearch')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={main}
                        onChange={(_, checked) => showMain(checked)}
                    />
                }
                label={t('dashboard.labels.showMainMenu')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={replay}
                        onChange={(_, checked) => showReplay(checked)}
                    />
                }
                label={t('dashboard.labels.showReplay')}
            />
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="apptype-radio-buttons-group-label">{t('dashboard.labels.appType')}</FormLabel>
                <RadioGroup
                    aria-labelledby="apptype-radio-buttons-group-label"
                    defaultValue="feed"
                    name="radio-buttons-group"
                    value={appType}
                    onChange={(_, value) => setAppType(value as 'feed' | 'flow')}
                >
                    <FormControlLabel
                        value="feed"
                        control={<Radio />}
                        label={t('dashboard.labels.feedApp')}
                    />
                    <FormControlLabel
                        value="flow"
                        control={<Radio />}
                        label={t('dashboard.labels.flowApp')}
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
