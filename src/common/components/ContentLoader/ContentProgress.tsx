import { Dialog, DialogContent, DialogTitle, LinearProgress } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';

interface Props {
    status: 'none' | 'download' | 'load';
    progress?: number;
}

export default function ContentProgress({ status, progress }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            hideBackdrop
            open={status !== 'none'}
        >
            <DialogTitle className={style.title}>{t('loader.titles.contentLoad')}</DialogTitle>
            <DialogContent className={style.content}>
                <div>{t(`loader.messages.content_${status}`)}</div>
                <LinearProgress
                    style={{ width: '100%' }}
                    variant={progress === undefined ? 'indeterminate' : 'determinate'}
                    value={progress === undefined ? undefined : Math.floor(progress)}
                />
            </DialogContent>
        </Dialog>
    );
}
