import { IconButton } from '@mui/material';
import ZoomInIcon from '@mui/icons-material/ZoomIn';
import ZoomOutIcon from '@mui/icons-material/ZoomOut';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

interface Props {
    onZoomIn: () => void;
    onZoomOut: () => void;
}

export default function ZoomControls({ onZoomIn, onZoomOut }: Props) {
    const { t } = useTranslation();

    return (
        <section className={style.zoomControls}>
            <IconButton
                color="inherit"
                size="medium"
                onClick={onZoomIn}
                aria-label={t('dashboard.actions.zoomIn')}
            >
                <ZoomInIcon fontSize="large" />
            </IconButton>
            <IconButton
                color="inherit"
                size="medium"
                onClick={onZoomOut}
                aria-label={t('dashboard.actions.zoomOut')}
            >
                <ZoomOutIcon fontSize="large" />
            </IconButton>
        </section>
    );
}
