import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilValue } from 'recoil';
import style from './style.module.css';
import { errorNotification } from '@genaism/state/errorState';

export default function ErrorDialog() {
    const { t } = useTranslation();
    const errorType = useRecoilValue(errorNotification);

    return (
        <Dialog open={errorType.size > 0}>
            <DialogTitle className={style.errorTitle}>{t('dashboard.titles.error')}</DialogTitle>
            <DialogContent className={style.errorContent}>
                {Array.from(errorType).map((x, ix) => (
                    <div key={ix}>{t(`dashboard.errors.${x}`, { defaultValue: t('dashboard.errors.unknown') })}</div>
                ))}
            </DialogContent>
        </Dialog>
    );
}
