import { IconMenuItem } from '@genaism/common/components/IconMenu';
import { IconButton, Popover, Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useAtom } from 'jotai';
import { settingClusterColouring } from '@genaism/apps/Dashboard/state/settingsState';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import style from './style.module.css';

export default function ClusterMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [colouring, setColouring] = useAtom(settingClusterColouring);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconMenuItem
                tooltip={t('dashboard.labels.clusterColouring')}
                selected={colouring > 0}
            >
                <IconButton
                    onClick={handleClick}
                    id="cluster-menu-button"
                    color="inherit"
                    aria-label={t('dashboard.labels.clusterColouring')}
                >
                    <WorkspacesIcon />
                </IconButton>
            </IconMenuItem>
            <Popover
                role="dialog"
                aria-labelledby="cluster-menu-button"
                className={style.clusterMenu}
                id={`cluster-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <div className={style.clusterContainer}>
                    <div
                        id="cluster-colouring-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.clusterColouring')}
                    </div>
                    <Slider
                        aria-labelledby="cluster-colouring-label"
                        value={colouring}
                        onChange={(_, value) => setColouring(value as number)}
                        min={0}
                        max={6}
                        step={null}
                        marks={[
                            { value: 0, label: t('dashboard.labels.none') },
                            { value: 2, label: '2' },
                            { value: 3, label: '3' },
                            { value: 4, label: '4' },
                            { value: 5, label: '5' },
                            { value: 6, label: '6' },
                        ]}
                        style={{ width: '200px' }}
                    />
                </div>
            </Popover>
        </>
    );
}
