import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';
import { menuShowGridMenu, menuShowSocialMenu } from '@genaism/state/menuState';

export default function VisualisationSettings() {
    const { t } = useTranslation();
    const [socialMenu, setSocialMenu] = useRecoilState(menuShowSocialMenu);
    const [gridMenu, setGridMenu] = useRecoilState(menuShowGridMenu);

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
