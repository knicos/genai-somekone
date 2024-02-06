import IconMenuItem from '@genaism/components/IconMenu/Item';
import { IconButton, ListItem, Menu, Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { settingClusterColouring } from '@genaism/state/settingsState';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import style from './style.module.css';

export default function ClusterMenu() {
    const { t } = useTranslation();
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const [colouring, setColouring] = useRecoilState(settingClusterColouring);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    return (
        <>
            <IconMenuItem tooltip={t('dashboard.labels.clusterColouring')}>
                <IconButton
                    onClick={handleClick}
                    id="cluster-menu-button"
                    color={colouring > 0 ? 'secondary' : 'inherit'}
                >
                    <WorkspacesIcon />
                </IconButton>
            </IconMenuItem>
            <Menu
                className={style.clusterMenu}
                MenuListProps={{
                    'aria-labelledby': 'cluster-menu-button',
                }}
                id={`cluster-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
                transformOrigin={{ vertical: 'top', horizontal: 'center' }}
            >
                <ListItem style={{ flexDirection: 'column', gap: '1rem' }}>
                    <div className={style.label}>{t('dashboard.labels.clusterColouring')}</div>
                    <Slider
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
                </ListItem>
            </Menu>
        </>
    );
}
