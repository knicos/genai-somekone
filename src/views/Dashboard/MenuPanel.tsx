import { IconButton } from '@mui/material';
import style from './style.module.css';
import SettingsIcon from '@mui/icons-material/Settings';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import { menuShowSettings, menuShowShare, menuShowTools } from '@genaism/state/menuState';
import { useTranslation } from 'react-i18next';
import IconMenu from '@genaism/components/IconMenu/IconMenu';
import IconMenuItem from '@genaism/components/IconMenu/Item';
import Spacer from '@genaism/components/IconMenu/Spacer';
import AppMenu from './AppMenu';
import ViewMenu from './ViewMenu';
import StorageMenu from './StorageMenu';
import { appConfiguration } from '@genaism/state/settingsState';
import PauseIcon from '@mui/icons-material/Pause';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import ToolsMenu from './ToolsMenu';

interface Props {
    onOpen?: (data: Blob) => void;
    onRefresh?: () => void;
}

export default function MenuPanel({ onOpen, onRefresh }: Props) {
    const { t } = useTranslation();
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [config, setConfig] = useRecoilState(appConfiguration);
    const showTools = useRecoilValue(menuShowTools);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);

    const doOpenFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.files && onOpen) {
                onOpen(e.currentTarget.files[0]);
                e.currentTarget.value = '';
            }
        },
        [onOpen]
    );

    return (
        <IconMenu
            title={t('dashboard.aria.appMenu')}
            placement="left"
            label={
                <div className={style.logo}>
                    <img
                        src="/logo48_bw_invert.png"
                        width="48"
                        height="48"
                        alt="Somekone logo"
                    />
                </div>
            }
        >
            <IconMenuItem tooltip={t('dashboard.labels.shareTip')}>
                <IconButton
                    color={showShare ? 'secondary' : 'inherit'}
                    onClick={doShowShare}
                    aria-label={t('dashboard.labels.shareTip')}
                >
                    <QrCode2Icon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.disableFeedApp')}>
                <IconButton
                    color={config?.disableFeedApp ? 'secondary' : 'inherit'}
                    onClick={() => setConfig((old) => ({ ...old, disableFeedApp: !old.disableFeedApp }))}
                    aria-label={t('dashboard.labels.disableFeedApp')}
                >
                    {config?.disableFeedApp ? <PlayCircleIcon /> : <PauseIcon />}
                </IconButton>
            </IconMenuItem>
            <ViewMenu />
            <AppMenu />
            <Spacer />
            <StorageMenu />
            {showTools && <ToolsMenu />}
            <IconMenuItem tooltip={t('dashboard.labels.refreshGraph')}>
                <IconButton
                    color={'inherit'}
                    onClick={onRefresh}
                    aria-label={t('dashboard.labels.refreshGraph')}
                >
                    <RefreshIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.showSettings')}>
                <IconButton
                    color={showSettings ? 'secondary' : 'inherit'}
                    onClick={doShowSettings}
                    aria-label={t('dashboard.labels.showSettings')}
                >
                    <SettingsIcon />
                </IconButton>
            </IconMenuItem>
            <input
                type="file"
                id="openfile"
                onChange={doOpenFile}
                hidden={true}
                accept=".zip,application/zip"
            />
        </IconMenu>
    );
}
