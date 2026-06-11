import { Alert, Dialog, DialogActions, DialogContent, DialogTitle, TextField } from '@mui/material';
import style from './style.module.css';
import AddLinkIcon from '@mui/icons-material/AddLink';
import { useRef, useState } from 'react';
import { Button } from '@genai-fi/base';
import { useTranslation } from 'react-i18next';
import { createSearchParams } from 'react-router-dom';
import { compressToEncodedURIComponent } from 'lz-string';

interface Props {
    title: string;
    description?: string;
}

export default function OpenItem({ title, description }: Props) {
    const [open, setOpen] = useState(false);
    const { t } = useTranslation(['dashboard']);
    const ref = useRef<HTMLInputElement>(null);

    return (
        <li>
            <button onClick={() => setOpen(true)}>
                <div className={style.iconContainer}>
                    <AddLinkIcon fontSize="inherit" />
                </div>
                <h2>{title}</h2>
                {description && <div className={style.description}>{description}</div>}
            </button>
            <Dialog
                open={open}
                onClose={() => setOpen(false)}
            >
                <DialogTitle>{title}</DialogTitle>
                <DialogContent>
                    <Alert severity="info">{t('library.open.alert')}</Alert>
                    <TextField
                        inputRef={ref}
                        autoFocus
                        margin="dense"
                        id="contenturl"
                        label={t('library.open.inputLabel')}
                        type="text"
                        fullWidth
                        variant="standard"
                    />
                </DialogContent>
                <DialogActions>
                    <Button
                        variant="outlined"
                        onClick={() => setOpen(false)}
                    >
                        {t('library.open.cancel')}
                    </Button>
                    <Button
                        variant="contained"
                        onClick={() => {
                            const value = ref.current?.value;
                            if (!value) return;
                            setOpen(false);
                            window.location.href = `/dashboard/socialgraph?${createSearchParams({
                                content: compressToEncodedURIComponent(JSON.stringify([value])),
                            })}`;
                        }}
                    >
                        {t('library.open.open')}
                    </Button>
                </DialogActions>
            </Dialog>
        </li>
    );
}
