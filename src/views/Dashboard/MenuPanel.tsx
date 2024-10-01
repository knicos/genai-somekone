import { IconButton } from '@mui/material';
import style from './style.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { useCallback, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
    menuMainMenu,
    menuShowSave,
    menuShowSettings,
    menuShowShare,
    menuShowTools,
    menuTreeMenu,
} from '@genaism/state/menuState';
import { useTranslation } from 'react-i18next';
import IconMenuItem from '@genaism/components/IconMenu/Item';
import { appConfiguration } from '@genaism/state/settingsState';
import PauseIcon from '@mui/icons-material/Pause';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ToolsMenu from './ToolsMenu';
import MenuTree from './MenuTree';
import ArrowBackIosIcon from '@mui/icons-material/ArrowBackIos';
import MenuIcon from '@mui/icons-material/Menu';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { MenuButton } from './MenuButton';

export default function MenuPanel() {
    const { t } = useTranslation();
    const [open, setOpen] = useState(false);
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [config, setConfig] = useRecoilState(appConfiguration);
    const [showSave, setShowSave] = useRecoilState(menuShowSave);
    const showTools = useRecoilValue(menuShowTools);
    const showMainMenu = useRecoilValue(menuMainMenu);
    const showTree = useRecoilValue(menuTreeMenu);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);

    if (!showMainMenu) return null;

    return (
        <nav className={open ? style.sideNav : style.sideNavClosed}>
            <div className={open ? style.logoRowOpen : style.logoRow}>
                {open && (
                    <div className={style.backgroundLogo}>
                        <img
                            src="/logo48_bw_invert.png"
                            width={48}
                            height={48}
                            alt="Somekone logo"
                        />
                        <h1>Somekone</h1>
                    </div>
                )}
                <IconButton
                    color="inherit"
                    onClick={() => setOpen((o) => !o)}
                >
                    {open ? <ArrowBackIosIcon fontSize="large" /> : <MenuIcon fontSize="large" />}
                </IconButton>
            </div>

            <IconMenuItem
                tooltip={t('dashboard.labels.shareTip')}
                hideTip={open}
                selected={showShare}
                fullWidth
            >
                <MenuButton
                    color="inherit"
                    onClick={doShowShare}
                    aria-label={t('dashboard.labels.shareTip')}
                    size="large"
                    variant="text"
                    fullWidth
                >
                    <QrCode2Icon fontSize="large" />
                    {open ? t('dashboard.labels.shareTip') : ''}
                </MenuButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.disableFeedApp')}
                hideTip={open}
                selected={config?.disableFeedApp}
                fullWidth
            >
                <MenuButton
                    color="inherit"
                    onClick={() => setConfig((old) => ({ ...old, disableFeedApp: !old.disableFeedApp }))}
                    aria-label={t('dashboard.labels.disableFeedApp')}
                    size="large"
                    variant="text"
                    fullWidth
                >
                    {config?.disableFeedApp ? <PlayCircleIcon fontSize="large" /> : <PauseIcon fontSize="large" />}
                    {open ? t('dashboard.labels.disableFeedApp') : ''}
                </MenuButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.saveTip')}
                hideTip={open}
                selected={showSave}
                fullWidth
            >
                <MenuButton
                    color="inherit"
                    onClick={() => setShowSave((s) => !s)}
                    aria-label={t('dashboard.labels.saveTip')}
                    size="large"
                    variant="text"
                    fullWidth
                >
                    <SaveAltIcon fontSize="large" />
                    {open ? t('dashboard.labels.saveTip') : ''}
                </MenuButton>
            </IconMenuItem>

            {showTree && <MenuTree open={open} />}

            {showTools && <ToolsMenu />}
            <div style={{ flexGrow: 1 }} />
            <IconMenuItem
                tooltip={t('dashboard.labels.showSettings')}
                hideTip={open}
                selected={showSettings}
                fullWidth
            >
                <MenuButton
                    color="inherit"
                    onClick={doShowSettings}
                    aria-label={t('dashboard.labels.showSettings')}
                    size="large"
                    variant="text"
                    fullWidth
                >
                    <SettingsIcon fontSize="large" />
                    {open ? t('dashboard.labels.showSettings') : ''}
                </MenuButton>
            </IconMenuItem>
        </nav>
    );
}
