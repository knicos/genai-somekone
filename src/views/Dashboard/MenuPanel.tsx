import { IconButton, Tooltip } from '@mui/material';
import style from './style.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import PolylineIcon from '@mui/icons-material/Polyline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShareIcon from '@mui/icons-material/Share';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { menuShowSave, menuShowSettings, menuShowShare } from '@genaism/state/menuState';
import { settingDisplayLines, settingShowOfflineUsers } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';

interface Props {
    onOpen?: (data: Blob) => void;
}

export default function MenuPanel({ onOpen }: Props) {
    const { t } = useTranslation();
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [showLines, setShowLines] = useRecoilState(settingDisplayLines);
    const [showOffline, setShowOffline] = useRecoilState(settingShowOfflineUsers);
    const [showSave, setShowSave] = useRecoilState(menuShowSave);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);
    const doShowLines = useCallback(() => setShowLines((s) => !s), [setShowLines]);
    const doShowOffline = useCallback(() => setShowOffline((s) => !s), [setShowOffline]);
    const doShowSave = useCallback(() => setShowSave((s) => !s), [setShowSave]);

    const doOpenFile = useCallback(
        (e: React.ChangeEvent<HTMLInputElement>) => {
            if (e.currentTarget.files && onOpen) {
                onOpen(e.currentTarget.files[0]);
                e.currentTarget.value = '';
            }
        },
        [onOpen]
    );

    const openFile = useCallback(() => {
        document.getElementById('openfile')?.click();
    }, []);

    return (
        <nav>
            <div className={style.menuContainer}>
                <div className={style.logo}>
                    <img
                        src="/logo48_bw_invert.png"
                        width="48"
                        height="48"
                    />
                </div>
                <Tooltip
                    title={t('dashboard.labels.shareTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={showShare ? 'secondary' : 'inherit'}
                        onClick={doShowShare}
                    >
                        <ShareIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.openTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color="inherit"
                        onClick={openFile}
                    >
                        <DriveFolderUploadIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.saveTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={showSave ? 'secondary' : 'inherit'}
                        onClick={doShowSave}
                    >
                        <SaveAltIcon />
                    </IconButton>
                </Tooltip>
                <div className={style.menuSpacer} />
                <Tooltip
                    title={t('dashboard.labels.showLinesTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={showLines ? 'secondary' : 'inherit'}
                        onClick={doShowLines}
                    >
                        <PolylineIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.showOfflineTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={showOffline ? 'secondary' : 'inherit'}
                        onClick={doShowOffline}
                    >
                        <PersonOutlineIcon />
                    </IconButton>
                </Tooltip>
                <div className={style.menuSpacer} />
                <IconButton
                    color={showSettings ? 'secondary' : 'inherit'}
                    onClick={doShowSettings}
                >
                    <SettingsIcon />
                </IconButton>
            </div>
            <input
                type="file"
                id="openfile"
                onChange={doOpenFile}
                hidden={true}
                accept=".zip,application/zip"
            />
        </nav>
    );
}
