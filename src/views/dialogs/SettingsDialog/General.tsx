import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { appConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';
import LangSelect from '@genaism/components/LangSelect/LangSelect';
import { menuMainMenu, menuShowReplay, menuShowTools } from '@genaism/state/menuState';

export default function GeneralSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);
    const [replay, showReplay] = useRecoilState(menuShowReplay);
    const [tools, setTools] = useRecoilState(menuShowTools);
    const [main, showMain] = useRecoilState(menuMainMenu);

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
            <FormControlLabel
                control={
                    <Checkbox
                        checked={tools}
                        onChange={(_, checked) => setTools(checked)}
                    />
                }
                label={t('dashboard.labels.showTools')}
            />
        </div>
    );
}
