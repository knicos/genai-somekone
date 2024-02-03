import { Dialog, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { PeerStatus } from '@genaism/hooks/peer';

interface Props {
    status?: PeerStatus;
}

export default function ProgressDialog({ status }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            hideBackdrop
            open={status !== 'starting' && status !== 'ready' && status !== 'failed'}
        >
            <DialogTitle className={style.title}>{t('loader.titles.connecting')}</DialogTitle>
            <DialogContent className={style.content}>{t(`loader.messages.${status || 'disconnected'}`)}</DialogContent>
        </Dialog>
    );
}
