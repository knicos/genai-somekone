import { IconButton } from '@mui/material';
import { IconMenu, IconMenuItem, Spacer } from '@genaism/common/components/IconMenu';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue } from 'jotai';
import { settingNodeMode } from '@genaism/apps/Dashboard/state/settingsState';
import { useEffect, useRef, useState } from 'react';
import DeleteDialog from '@genaism/apps/Dashboard/visualisations/SocialGraph/DeleteDialog';
import {
    menuHideGridMenuActions,
    menuHideGridMenuContent,
    menuNodeSelectAction,
    menuSelectedUser,
    menuShowGridMenu,
    menuShowUserPanel,
} from '@genaism/apps/Dashboard/state/menuState';
import { UserNodeId } from '@genai-fi/recom';
import { useServices } from '@genaism/hooks/services';
import ImageIcon from '@mui/icons-material/Image';
import ClusterMenu from '@genaism/apps/Dashboard/visualisations/SocialGraph/ClusterMenu';

export default function GridMenu() {
    const { t } = useTranslation();
    const [nodeMode, setNodeMode] = useAtom(settingNodeMode);
    const [showDelete, setShowDelete] = useState(false);
    const [panel, setPanel] = useAtom(menuShowUserPanel);
    const [selectedUser, setSelectedUser] = useAtom(menuSelectedUser);
    const showMenu = useAtomValue(menuShowGridMenu);
    const hideActions = useAtomValue(menuHideGridMenuActions);
    const hideContent = useAtomValue(menuHideGridMenuContent);
    const selectAction = useAtomValue(menuNodeSelectAction);
    const userRef = useRef<UserNodeId | undefined>(undefined);
    const { profiler, actionLog, similarity } = useServices();

    useEffect(() => {
        if (selectedUser && selectedUser !== userRef.current && selectAction !== 'none') {
            setPanel(selectAction);
        }
        userRef.current = selectedUser;
    }, [selectedUser, selectAction, setPanel]);

    if (!showMenu) return null;

    return (
        <IconMenu
            placement="top"
            selected={!!selectedUser}
            label={
                <div className={style.menuLogo}>
                    {selectedUser ? profiler.getUserData(selectedUser)?.name : t('dashboard.titles.people')}
                </div>
            }
        >
            {!hideContent && (
                <>
                    <IconMenuItem
                        tooltip={t('dashboard.labels.profileImage')}
                        selected={nodeMode === 'profileImage'}
                    >
                        <IconButton
                            color="inherit"
                            onClick={() => setNodeMode('profileImage')}
                            data-testid="social-menu-profileImage"
                            aria-label={t('dashboard.labels.profileImage')}
                        >
                            <ImageIcon />
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem
                        tooltip={t('dashboard.labels.engagedImages')}
                        selected={nodeMode === 'image'}
                    >
                        <IconButton
                            color={'inherit'}
                            onClick={() => setNodeMode('image')}
                            data-testid="social-menu-images"
                            aria-label={t('dashboard.labels.engagedImages')}
                        >
                            <CollectionsIcon />
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem
                        tooltip={t('dashboard.labels.topicCloud')}
                        selected={nodeMode === 'word'}
                    >
                        <IconButton
                            color={'inherit'}
                            onClick={() => setNodeMode('word')}
                            aria-label={t('dashboard.labels.topicCloud')}
                        >
                            <TextFieldsIcon />
                        </IconButton>
                    </IconMenuItem>
                    <Spacer />
                </>
            )}
            <ClusterMenu />

            <Spacer />
            {!hideActions && (
                <>
                    <IconMenuItem
                        tooltip={t('dashboard.labels.showFeed')}
                        selected={panel === 'feed'}
                    >
                        <IconButton
                            disabled={!selectedUser}
                            data-testid="social-menu-feed-button"
                            color={'inherit'}
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
                            disabled={!selectedUser}
                            data-testid="social-menu-data-button"
                            color={'inherit'}
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
                            disabled={!selectedUser}
                            data-testid="social-menu-profile-button"
                            color={'inherit'}
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
                            disabled={!selectedUser}
                            data-testid="social-menu-recom-button"
                            color={'inherit'}
                            onClick={() => setPanel('recommendations')}
                            aria-label={t('dashboard.labels.showRecommendations')}
                        >
                            <ImageSearchIcon />
                        </IconButton>
                    </IconMenuItem>
                    <Spacer />
                </>
            )}
            <IconMenuItem tooltip={t('dashboard.labels.deleteUser')}>
                <IconButton
                    disabled={!selectedUser}
                    color="inherit"
                    onClick={() => setShowDelete(true)}
                    aria-label={t('dashboard.labels.deleteUser')}
                >
                    <DeleteForeverIcon />
                </IconButton>
            </IconMenuItem>
            {selectedUser && (
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
            )}
        </IconMenu>
    );
}
