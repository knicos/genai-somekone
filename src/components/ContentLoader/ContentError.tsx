import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

interface Props {
    error: 'none' | 'download' | 'load';
}

export default function ContentError({ error }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            hideBackdrop
            open={error !== 'none'}
        >
            <DialogTitle className={style.errorTitle}>{t('loader.titles.error')}</DialogTitle>
            <DialogContent className={style.errorContent}>
                <div>{t(`loader.errors.${error}`)}</div>
            </DialogContent>
        </Dialog>
    );
}
