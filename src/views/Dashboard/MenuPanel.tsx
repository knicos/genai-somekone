import { IconButton } from '@mui/material';
import style from './style.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import PolylineIcon from '@mui/icons-material/Polyline';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import ShareIcon from '@mui/icons-material/Share';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { menuShowSettings, menuShowShare } from '@genaism/state/menuState';
import { settingDisplayLines, settingShowOfflineUsers } from '@genaism/state/settingsState';

interface Props {
    onOpen?: (data: Blob) => void;
}

export default function MenuPanel({ onOpen }: Props) {
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [showLines, setShowLines] = useRecoilState(settingDisplayLines);
    const [showOffline, setShowOffline] = useRecoilState(settingShowOfflineUsers);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);
    const doShowLines = useCallback(() => setShowLines((s) => !s), [setShowLines]);
    const doShowOffline = useCallback(() => setShowOffline((s) => !s), [setShowOffline]);

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
                <IconButton
                    color={showShare ? 'secondary' : 'inherit'}
                    onClick={doShowShare}
                >
                    <ShareIcon />
                </IconButton>
                <IconButton
                    color="inherit"
                    onClick={openFile}
                >
                    <DriveFolderUploadIcon />
                </IconButton>
                <div className={style.menuSpacer} />
                <IconButton
                    color={showLines ? 'secondary' : 'inherit'}
                    onClick={doShowLines}
                >
                    <PolylineIcon />
                </IconButton>
                <IconButton
                    color={showOffline ? 'secondary' : 'inherit'}
                    onClick={doShowOffline}
                >
                    <PersonOutlineIcon />
                </IconButton>
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
