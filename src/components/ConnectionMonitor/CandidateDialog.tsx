import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { Button } from '../Button/Button';
import { useRecoilValue } from 'recoil';
import { webrtcActive } from '@genaism/state/webrtcState';
import { useOnlyOnce } from '@genaism/hooks/onlyOnce';

interface Props {
    relay?: boolean;
}

export default function CandidateDialog({ relay }: Props) {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [seen, setSeen] = useState(false);
    const perm = useRecoilValue(webrtcActive);
    const block = useOnlyOnce('genai-wifi-warning', seen);

    useEffect(() => {
        if (relay && !block) setOpen(true);
    }, [relay, block]);

    return (
        <Dialog
            hideBackdrop
            open={open || false}
        >
            <DialogTitle className={style.title}>{t('loader.titles.networkType')}</DialogTitle>
            <DialogContent className={style.content}>
                {perm === 'relay' ? t('loader.messages.permNetwork') : t('loader.messages.wifiNetwork')}
            </DialogContent>
            <DialogActions>
                <Button
                    onClick={() => {
                        setOpen(false);
                        setSeen(true);
                    }}
                    variant="contained"
                >
                    {t('loader.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
