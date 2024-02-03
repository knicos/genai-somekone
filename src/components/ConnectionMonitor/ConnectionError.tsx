import { PeerErrorType } from '@genaism/hooks/peer';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

interface Props {
    hasError?: boolean;
    error?: PeerErrorType;
}

export default function ConnectionError({ hasError, error }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            hideBackdrop
            open={(hasError && error && error !== 'none') || false}
        >
            <DialogTitle className={style.errorTitle}>{t('loader.titles.error')}</DialogTitle>
            <DialogContent className={style.errorContent}>
                <div>{t(`loader.errors.${error}`, { defaultValue: t('loader.errors.unknown') })}</div>
            </DialogContent>
        </Dialog>
    );
}
