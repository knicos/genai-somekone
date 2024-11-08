import { IconMenu, IconMenuItem, Spacer } from '@genaism/components/IconMenu';
import { useServices } from '@genaism/hooks/services';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { IconButton } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import DeleteDialog from './DeleteDialog';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { menuSelectedUser, menuShowUserPanel } from '@genaism/state/menuState';

interface Props {
    x: number;
    y: number;
}

export default function UserMenu({ x, y }: Props) {
    const { t } = useTranslation();
    const { profiler, actionLog, similarity } = useServices();
    const [showDelete, setShowDelete] = useState(false);
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const [selectedUser, setSelectedUser] = useRecoilState(menuSelectedUser);

    if (!selectedUser) return null;

    return (
        <IconMenu
            title={t('dashboard.aria.socialMenu')}
            placement="free"
            x={x}
            y={y}
            selected={!!selectedUser}
            label={
                <div className={style.menuLogo}>
                    {selectedUser ? profiler.getUserData(selectedUser)?.name : t('dashboard.titles.people')}
                </div>
            }
        >
            <IconMenuItem
                tooltip={t('dashboard.labels.showFeed')}
                selected={panel === 'feed'}
            >
                <IconButton
                    data-testid="social-menu-feed-button"
                    color="inherit"
                    onClick={() => setPanel('feed')}
                    aria-label={t('dashboard.labels.showFeed')}
                >
                    <PhoneAndroidIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.showData')}
                selected={panel === 'data'}
            >
                <IconButton
                    data-testid="social-menu-data-button"
                    color="inherit"
                    onClick={() => setPanel('data')}
                    aria-label={t('dashboard.labels.showData')}
                >
                    <QueryStatsIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.showProfile')}
                selected={panel === 'profile'}
            >
                <IconButton
                    data-testid="social-menu-profile-button"
                    color="inherit"
                    onClick={() => setPanel('profile')}
                    aria-label={t('dashboard.labels.showProfile')}
                >
                    <PersonIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.showRecommendations')}
                selected={panel === 'recommendations'}
            >
                <IconButton
                    data-testid="social-menu-recom-button"
                    color="inherit"
                    onClick={() => setPanel('recommendations')}
                    aria-label={t('dashboard.labels.showRecommendations')}
                >
                    <ImageSearchIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.deleteUser')}>
                <IconButton
                    color="inherit"
                    onClick={() => setShowDelete(true)}
                    aria-label={t('dashboard.labels.deleteUser')}
                >
                    <DeleteForeverIcon />
                </IconButton>
            </IconMenuItem>
            <DeleteDialog
                name={profiler.getUserData(selectedUser)?.name || 'No Name'}
                open={showDelete}
                onClose={() => setShowDelete(false)}
                onDelete={() => {
                    profiler.removeProfile(selectedUser);
                    actionLog.removeLogs(selectedUser);
                    similarity.reset();
                    setSelectedUser(undefined);
                    setShowDelete(false);
                }}
            />
        </IconMenu>
    );
}
