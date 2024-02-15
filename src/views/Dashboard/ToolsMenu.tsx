import IconMenuItem from '@genaism/components/IconMenu/Item';
import { IconButton, ListItemText, Menu, MenuItem } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import HandymanIcon from '@mui/icons-material/Handyman';
import { anonComments } from '@genaism/services/content/content';
import { anonLogs } from '@genaism/services/profiler/logs';
import { anonProfiles } from '@genaism/services/profiler/profiler';

export default function ToolsMenu() {
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
            <IconMenuItem tooltip={t('dashboard.labels.toolsMenu')}>
                <IconButton
                    onClick={handleClick}
                    color={'inherit'}
                    id="tools-menu-button"
                    aria-label={t('dashboard.labels.toolsMenu')}
                    aria-haspopup={true}
                    aria-expanded={open}
                >
                    <HandymanIcon />
                </IconButton>
            </IconMenuItem>
            <Menu
                role="dialog"
                aria-labelledby="tools-menu-button"
                id={`tools-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                <MenuItem
                    onClick={() => {
                        anonComments();
                        anonLogs();
                        anonProfiles();
                    }}
                >
                    <ListItemText>{t('dashboard.labels.toolAnonymise')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
