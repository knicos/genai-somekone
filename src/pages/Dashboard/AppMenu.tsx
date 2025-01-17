import { IconMenuItem } from '@genaism/components/IconMenu';
import { IconButton, ListItemIcon, ListItemText, Menu, MenuItem } from '@mui/material';
import PhoneAndroidIcon from '@mui/icons-material/PhoneAndroid';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import { useRecoilState } from 'recoil';
import { appConfiguration } from '@genaism/state/settingsState';

export default function AppMenu() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);
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
            <IconMenuItem tooltip={t('dashboard.labels.appOptions')}>
                <IconButton
                    onClick={handleClick}
                    color={'inherit'}
                    id="app-menu-button"
                    aria-label={t('dashboard.labels.appOptions')}
                    aria-haspopup={true}
                    aria-expanded={open}
                >
                    <PhoneAndroidIcon />
                </IconButton>
            </IconMenuItem>
            <Menu
                role="dialog"
                aria-labelledby="app-menu-button"
                id={`app-menu`}
                anchorEl={anchorEl}
                open={open}
                onClose={handleClose}
                anchorOrigin={{ vertical: 'center', horizontal: 'right' }}
                transformOrigin={{ vertical: 'center', horizontal: 'left' }}
            >
                <MenuItem onClick={() => setConfig((old) => ({ ...old, hideActionsButton: !old.hideActionsButton }))}>
                    <ListItemIcon>
                        <CheckBoxIcon color={config?.hideActionsButton ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.hideFeedMenu')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setConfig((old) => ({ ...old, hideDataView: !old.hideDataView }))}>
                    <ListItemIcon>
                        <CheckBoxIcon color={config?.hideDataView ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.hideDataView')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setConfig((old) => ({ ...old, hideProfileView: !old.hideProfileView }))}>
                    <ListItemIcon>
                        <CheckBoxIcon color={config?.hideProfileView ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.hideProfileView')}</ListItemText>
                </MenuItem>
                <MenuItem
                    onClick={() =>
                        setConfig((old) => ({ ...old, hideRecommendationsView: !old.hideRecommendationsView }))
                    }
                >
                    <ListItemIcon>
                        <CheckBoxIcon color={config?.hideRecommendationsView ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.hideRecommendationsView')}</ListItemText>
                </MenuItem>
                <MenuItem onClick={() => setConfig((old) => ({ ...old, showTopicLabels: !old.showTopicLabels }))}>
                    <ListItemIcon>
                        <CheckBoxIcon color={config?.showTopicLabels ? 'success' : 'disabled'} />
                    </ListItemIcon>
                    <ListItemText>{t('dashboard.labels.showFeedImageLabels')}</ListItemText>
                </MenuItem>
            </Menu>
        </>
    );
}
