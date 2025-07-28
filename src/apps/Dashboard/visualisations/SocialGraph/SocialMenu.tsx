import { IconButton } from '@mui/material';
import { IconMenu, IconMenuItem, Spacer } from '@genaism/common/components/IconMenu';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';

import RefreshIcon from '@mui/icons-material/Refresh';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { settingNodeMode } from '@genaism/apps/Dashboard/state/settingsState';
import { useEffect, useRef, useState } from 'react';

import {
    menuNodeSelectAction,
    menuSelectedUser,
    menuShowSocialMenu,
    menuShowUserPanel,
} from '@genaism/apps/Dashboard/state/menuState';
import ClusterMenu from './ClusterMenu';
import ImageIcon from '@mui/icons-material/Image';
import { UserNodeId } from '@genai-fi/recom';
import DownloadIcon from '@mui/icons-material/Download';
import SettingsIcon from '@mui/icons-material/Settings';
import { useEventEmit } from '@genaism/hooks/events';
import SocialSettingsDialog from './SettingsDialog';

export default function SocialMenu() {
    const { t } = useTranslation();
    const [nodeMode, setNodeMode] = useAtom(settingNodeMode);
    const setPanel = useSetAtom(menuShowUserPanel);
    const selectedUser = useAtomValue(menuSelectedUser);
    const showMenu = useAtomValue(menuShowSocialMenu);
    const selectAction = useAtomValue(menuNodeSelectAction);
    const userRef = useRef<UserNodeId | undefined>(undefined);
    const saveGraph = useEventEmit('save_graph');
    const refreshGraph = useEventEmit('refresh_graph');
    const [showSettings, setShowSettings] = useState(false);

    useEffect(() => {
        if (selectedUser && selectedUser !== userRef.current && selectAction !== 'none') {
            setPanel(selectAction);
        }
        userRef.current = selectedUser;
    }, [selectedUser, selectAction, setPanel]);

    if (!showMenu) return null;

    return (
        <>
            <IconMenu
                title={t('dashboard.aria.socialMenu')}
                placement="top"
                label={<div className={style.menuLogo}>{t('dashboard.titles.people')}</div>}
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
                        color="inherit"
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
                        color="inherit"
                        onClick={() => setNodeMode('word')}
                        aria-label={t('dashboard.labels.topicCloud')}
                    >
                        <TextFieldsIcon />
                    </IconButton>
                </IconMenuItem>
                <Spacer />
                <ClusterMenu />
                <Spacer />
                <IconMenuItem tooltip={t('dashboard.labels.saveGraphImage')}>
                    <IconButton
                        color="inherit"
                        onClick={saveGraph}
                        aria-label={t('dashboard.labels.saveGraphImage')}
                    >
                        <DownloadIcon />
                    </IconButton>
                </IconMenuItem>
                <IconMenuItem tooltip={t('dashboard.labels.refreshGraph')}>
                    <IconButton
                        color="inherit"
                        onClick={refreshGraph}
                        aria-label={t('dashboard.labels.refreshGraph')}
                    >
                        <RefreshIcon />
                    </IconButton>
                </IconMenuItem>
                <IconMenuItem tooltip={t('dashboard.labels.showSocialGraphSettings')}>
                    <IconButton
                        color="inherit"
                        onClick={() => setShowSettings(true)}
                        aria-label={t('dashboard.labels.showSocialGraphSettings')}
                    >
                        <SettingsIcon />
                    </IconButton>
                </IconMenuItem>
            </IconMenu>
            <SocialSettingsDialog
                open={showSettings}
                onClose={() => setShowSettings(false)}
            />
        </>
    );
}
