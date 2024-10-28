import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import style from './style.module.css';
import { appConfiguration } from '@genaism/state/settingsState';
import PauseCircleIcon from '@mui/icons-material/PauseCircle';

export default function BlockDialog() {
    const { t } = useTranslation();
    const config = useRecoilValue(appConfiguration);

    return (
        <Dialog open={config?.disableFeedApp || false}>
            <DialogTitle className={style.title}>{t('dashboard.titles.paused')}</DialogTitle>
            <DialogContent className={style.content}>
                <div className={style.icon}>
                    <PauseCircleIcon fontSize="inherit" />
                </div>
                {t('dashboard.messages.paused')}
            </DialogContent>
        </Dialog>
    );
}
