import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

interface Props {
    open?: boolean;
}

export default function IceDialog({ open }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            hideBackdrop
            open={open || false}
        >
            <DialogTitle className={style.title}>{t('loader.titles.iceConfig')}</DialogTitle>
            <DialogContent className={style.content}>{t('loader.messages.getIceConfig')}</DialogContent>
        </Dialog>
    );
}
