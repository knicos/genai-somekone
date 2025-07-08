import { IconMenuItem } from '@genaism/common/components/IconMenu';
import { IconButton, Popover, Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAtom } from 'jotai';
import SpeedIcon from '@mui/icons-material/Speed';
import style from './style.module.css';
import { menuReplaySpeed } from '@genaism/apps/Dashboard/state/menuState';

export default function SpeedMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [speed, setSpeed] = useAtom(menuReplaySpeed);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconMenuItem tooltip={t('dashboard.labels.playbackSpeed')}>
                <IconButton
                    onClick={handleClick}
                    id="speed-menu-button"
                    color="inherit"
                    aria-label={t('dashboard.labels.playbackSpeed')}
                >
                    <SpeedIcon />
                </IconButton>
            </IconMenuItem>
            <Popover
                role="dialog"
                aria-labelledby="speed-menu-button"
                className={style.speedMenu}
                id={`speed-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
                transformOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <div className={style.speedContainer}>
                    <div
                        id="speed-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.playbackSpeed')}
                    </div>
                    <Slider
                        aria-labelledby="cluster-colouring-label"
                        value={speed}
                        onChange={(_, value) => setSpeed(value as number)}
                        min={1}
                        max={20}
                        step={1}
                        marks={[
                            { value: 1, label: '1x' },
                            { value: 4, label: '4x' },
                            { value: 10, label: '10x' },
                            { value: 20, label: '20x' },
                        ]}
                        style={{ width: '200px' }}
                    />
                </div>
            </Popover>
        </>
    );
}
