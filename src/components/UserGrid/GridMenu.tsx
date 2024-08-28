import { IconButton } from '@mui/material';
import IconMenu from '../IconMenu/IconMenu';
import IconMenuItem from '../IconMenu/Item';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Spacer from '../IconMenu/Spacer';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import { settingNodeMode } from '@genaism/state/settingsState';
import { useEffect, useRef, useState } from 'react';
import DeleteDialog from '../SocialGraph/DeleteDialog';
import { menuNodeSelectAction, menuSelectedUser, menuShowGridMenu, menuShowUserPanel } from '@genaism/state/menuState';
import { UserNodeId } from '@knicos/genai-recom';
import { useServices } from '@genaism/hooks/services';
import ImageIcon from '@mui/icons-material/Image';
import ClusterMenu from '../SocialGraph/ClusterMenu';

export default function GridMenu() {
    const { t } = useTranslation();
    const [nodeMode, setNodeMode] = useRecoilState(settingNodeMode);
    const [showDelete, setShowDelete] = useState(false);
    const [panel, setPanel] = useRecoilState(menuShowUserPanel);
    const selectedUser = useRecoilValue(menuSelectedUser);
    const showMenu = useRecoilValue(menuShowGridMenu);
    const selectAction = useRecoilValue(menuNodeSelectAction);
    const userRef = useRef<UserNodeId | undefined>();
    const { graph, profiler } = useServices();

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
            <ClusterMenu />

            <Spacer />
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
                        graph.removeNode(selectedUser);
                        setShowDelete(false);
                    }}
                />
            )}
        </IconMenu>
    );
}
