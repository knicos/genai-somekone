import { IconMenuItem } from '@genaism/common/components/IconMenu';
import { IconButton, Popover, Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import style from './style.module.css';
import TuneIcon from '@mui/icons-material/Tune';

interface Props {
    factor: number;
    onFactor: (f: number) => void;
}

export default function FactorMenu({ factor, onFactor }: Props) {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconMenuItem tooltip={t('dashboard.labels.heatmapFactor')}>
                <IconButton
                    onClick={handleClick}
                    id="cluster-menu-button"
                    color="inherit"
                    aria-label={t('dashboard.labels.heatmapFactor')}
                >
                    <TuneIcon />
                </IconButton>
            </IconMenuItem>
            <Popover
                role="dialog"
                aria-labelledby="factor-menu-button"
                className={style.factorMenu}
                id={`factor-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <div className={style.factorContainer}>
                    <div
                        id="factor-colouring-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.heatmapFactor')}
                    </div>
                    <Slider
                        aria-labelledby="factor-colouring-label"
                        value={factor}
                        onChange={(_, value) => onFactor(value as number)}
                        min={0}
                        max={10}
                        step={0.5}
                        style={{ width: '200px' }}
                    />
                </div>
            </Popover>
        </>
    );
}
