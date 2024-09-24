import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { errorNotification } from '@genaism/state/errorState';
import CloseIcon from '@mui/icons-material/Close';

export default function ErrorDialog() {
    const { t } = useTranslation();
    const [errorType, setErrors] = useRecoilState(errorNotification);

    return (
        <Dialog open={errorType.size > 0}>
            <DialogTitle className={style.errorTitle}>{t('dashboard.titles.error')}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={() => setErrors(new Set())}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent className={style.errorContent}>
                {Array.from(errorType).map((x, ix) => (
                    <div key={ix}>{t(`dashboard.errors.${x}`, { defaultValue: t('dashboard.errors.unknown') })}</div>
                ))}
            </DialogContent>
        </Dialog>
    );
}
