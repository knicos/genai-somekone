import { IconButton } from '@mui/material';
import IconMenu from '../IconMenu/IconMenu';
import IconMenuItem from '../IconMenu/Item';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import WorkspacesIcon from '@mui/icons-material/Workspaces';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import Spacer from '../IconMenu/Spacer';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getNodeData, removeNode } from '@genaism/services/graph/nodes';
import { useRecoilState } from 'recoil';
import { settingClusterColouring, settingNodeMode } from '@genaism/state/settingsState';
import { useState } from 'react';
import DeleteDialog from './DeleteDialog';
import { menuShowFeed, menuShowUserData, menuShowUserProfile } from '@genaism/state/menuState';

interface Props {
    selectedUser?: UserNodeId;
}

interface UserData {
    name: string;
}

export default function SocialMenu({ selectedUser }: Props) {
    const { t } = useTranslation();
    const [nodeMode, setNodeMode] = useRecoilState(settingNodeMode);
    const [colouring, setColouring] = useRecoilState(settingClusterColouring);
    const [showDelete, setShowDelete] = useState(false);
    const [showFeed, setShowFeed] = useRecoilState(menuShowFeed);
    const [showData, setShowData] = useRecoilState(menuShowUserData);
    const [showProfile, setShowProfile] = useRecoilState(menuShowUserProfile);

    return (
        <IconMenu
            placement="top"
            label={
                <div className={style.menuLogo}>
                    {selectedUser ? getNodeData<UserData>(selectedUser)?.name : t('dashboard.titles.people')}
                </div>
            }
        >
            <IconMenuItem tooltip={t('dashboard.labels.engagedImages')}>
                <IconButton
                    color={nodeMode === 'image' ? 'secondary' : 'inherit'}
                    onClick={() => setNodeMode('image')}
                >
                    <CollectionsIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.topicCloud')}>
                <IconButton
                    color={nodeMode === 'word' ? 'secondary' : 'inherit'}
                    onClick={() => setNodeMode('word')}
                >
                    <TextFieldsIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.clusterColouring')}>
                <IconButton
                    color={colouring ? 'secondary' : 'inherit'}
                    onClick={() => setColouring((old) => !old)}
                >
                    <WorkspacesIcon />
                </IconButton>
            </IconMenuItem>
            {selectedUser && (
                <>
                    <Spacer />
                    <IconMenuItem tooltip={t('dashboard.labels.showFeed')}>
                        <IconButton
                            data-testid="social-menu-feed-button"
                            color={showFeed ? 'secondary' : 'inherit'}
                            onClick={() => setShowFeed((old) => (old ? undefined : selectedUser))}
                        >
                            <PhoneAndroidIcon />
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem tooltip={t('dashboard.labels.showData')}>
                        <IconButton
                            data-testid="social-menu-data-button"
                            color={showData ? 'secondary' : 'inherit'}
                            onClick={() => setShowData((old) => (old ? undefined : selectedUser))}
                        >
                            <QueryStatsIcon />
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem tooltip={t('dashboard.labels.showProfile')}>
                        <IconButton
                            data-testid="social-menu-profile-button"
                            color={showProfile ? 'secondary' : 'inherit'}
                            onClick={() => setShowProfile((old) => (old ? undefined : selectedUser))}
                        >
                            <PersonIcon />
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem tooltip={t('dashboard.labels.showRecommendations')}>
                        <IconButton color="inherit">
                            <ImageSearchIcon />
                        </IconButton>
                    </IconMenuItem>
                    <Spacer />
                    <IconMenuItem tooltip={t('dashboard.labels.deleteUser')}>
                        <IconButton
                            color="inherit"
                            onClick={() => setShowDelete(true)}
                        >
                            <DeleteForeverIcon />
                        </IconButton>
                    </IconMenuItem>
                    <DeleteDialog
                        name={getNodeData<UserData>(selectedUser)?.name || 'No Name'}
                        open={showDelete}
                        onClose={() => setShowDelete(false)}
                        onDelete={() => {
                            removeNode(selectedUser);
                            setShowDelete(false);
                        }}
                    />
                </>
            )}
        </IconMenu>
    );
}
