import IconMenuItem from '@genaism/components/IconMenu/Item';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import StorageIcon from '@mui/icons-material/Storage';
import { useTranslation } from 'react-i18next';
import { useCallback, useState } from 'react';
import { useRecoilState } from 'recoil';
import { menuShowSave } from '@genaism/state/menuState';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SaveAltIcon from '@mui/icons-material/SaveAlt';

export default function StorageMenu() {
    const { t } = useTranslation();
    const [showSave, setShowSave] = useRecoilState(menuShowSave);
    const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
    const open = Boolean(anchorEl);
    const handleClick = (event: React.MouseEvent<HTMLElement>) => {
        setAnchorEl(event.currentTarget);
    };
    const handleClose = () => {
        setAnchorEl(null);
    };

    const openFile = useCallback(() => {
        document.getElementById('openfile')?.click();
    }, []);

    const doShowSave = useCallback(() => setShowSave((s) => !s), [setShowSave]);

    return (
        <>
            <IconMenuItem tooltip={t('dashboard.labels.storageOptions')}>
                <IconButton
                    onClick={handleClick}
                    color={'inherit'}
                    id="storage-menu-button"
                    aria-label={t('dashboard.labels.storageOptions')}
                    aria-haspopup={true}
                    aria-expanded={open}
                >
                    <StorageIcon />
                </IconButton>
            </IconMenuItem>
            <Menu
                aria-labelledby="storage-menu-button"
                role="dialog"
                id={`storage-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                <MenuItem onClick={openFile}>
                    <ListItemIcon>
                        <DriveFolderUploadIcon />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.openTip')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={doShowSave}>
                    <ListItemIcon>
                        <SaveAltIcon color={showSave ? 'secondary' : 'inherit'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.saveTip')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
