import { Dialog, DialogActions, DialogContent, DialogTitle } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { Button } from '../Button/Button';

interface Props {
    name: string;
    open: boolean;
    onClose: () => void;
    onDelete: () => void;
}

export default function DeleteDialog({ open, onClose, onDelete, name }: Props) {
    const { t } = useTranslation();

    return (
        <Dialog
            open={open}
            onClose={onClose}
        >
            <DialogTitle className={style.deleteTitle}>{t('dashboard.titles.deleteUser')}</DialogTitle>
            <DialogContent className={style.deleteContent}>
                {t('dashboard.messages.confirmDeleteUser', { name })}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    color="primary"
                    onClick={onDelete}
                >
                    Delete
                </Button>
                <Button
                    variant="outlined"
                    color="primary"
                    onClick={onClose}
                >
                    Cancel
                </Button>
            </DialogActions>
        </Dialog>
    );
}
