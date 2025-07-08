import { useAtom } from 'jotai';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';
import { menuShowGridMenu, menuShowSocialMenu } from '@genaism/apps/Dashboard/state/menuState';

export default function VisualisationSettings() {
    const { t } = useTranslation();
    const [socialMenu, setSocialMenu] = useAtom(menuShowSocialMenu);
    const [gridMenu, setGridMenu] = useAtom(menuShowGridMenu);

    return (
        <div className={style.column}>
            <FormControlLabel
                control={
                    <Checkbox
                        checked={socialMenu || false}
                        onChange={(_, checked) => setSocialMenu(checked)}
                    />
                }
                label={t('settings.vis.socialMenu')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={gridMenu || false}
                        onChange={(_, checked) => setGridMenu(checked)}
                    />
                }
                label={t('settings.vis.gridMenu')}
            />
        </div>
    );
}
