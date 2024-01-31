import IconMenuItem from '@genaism/components/IconMenu/Item';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { useRecoilState } from 'recoil';
import { menuGraphType } from '@genaism/state/menuState';
import AppsIcon from '@mui/icons-material/Apps';
import PeopleIcon from '@mui/icons-material/People';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';

export default function ViewMenu() {
    const { t } = useTranslation();
    const [graphMode, setGraphMode] = useRecoilState(menuGraphType);
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
            <IconMenuItem tooltip={t('dashboard.labels.viewOptions')}>
                <IconButton
                    onClick={handleClick}
                    color={'inherit'}
                    id="view-menu-button"
                >
                    <BubbleChartIcon />
                </IconButton>
            </IconMenuItem>
            <Menu
                MenuListProps={{
                    'aria-labelledby': 'view-menu-button',
                }}
                id={`view-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                <MenuItem
                    selected={graphMode === 'grid'}
                    onClick={() => setGraphMode('grid')}
                >
                    <ListItemIcon>
                        <AppsIcon color={graphMode === 'grid' ? 'secondary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.showUserGrid')}</ListItemText>
                </MenuItem>
                <MenuItem
                    selected={graphMode === 'social'}
                    onClick={() => setGraphMode('social')}
                >
                    <ListItemIcon>
                        <PeopleIcon color={graphMode === 'social' ? 'secondary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.showSocialGraph')}</ListItemText>
                </MenuItem>
                <MenuItem
                    selected={graphMode === 'content'}
                    onClick={() => setGraphMode('content')}
                >
                    <ListItemIcon>
                        <CollectionsIcon color={graphMode === 'content' ? 'secondary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.showContentGraph')}</ListItemText>
                </MenuItem>
                <MenuItem
                    selected={graphMode === 'topic'}
                    onClick={() => setGraphMode('topic')}
                >
                    <ListItemIcon>
                        <TextFieldsIcon color={graphMode === 'topic' ? 'secondary' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.showTopicGraph')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
