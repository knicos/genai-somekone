import { IconButton, Tooltip } from '@mui/material';
import style from './style.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShareIcon from '@mui/icons-material/Share';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { menuShowSave, menuShowSettings, menuShowShare } from '@genaism/state/menuState';
import { settingNodeMode } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';

interface Props {
    onOpen?: (data: Blob) => void;
}

export default function MenuPanel({ onOpen }: Props) {
    const { t } = useTranslation();
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [showSave, setShowSave] = useRecoilState(menuShowSave);
    const [displayMode, setDisplayMode] = useRecoilState(settingNodeMode);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);
    const doShowImages = useCallback(() => setDisplayMode('image'), [setDisplayMode]);
    const doShowWords = useCallback(() => setDisplayMode('word'), [setDisplayMode]);
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
                    title={t('dashboard.labels.showImagesTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={displayMode === 'image' ? 'secondary' : 'inherit'}
                        onClick={doShowImages}
                    >
                        <CollectionsIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.showWordsTip')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={displayMode === 'word' ? 'secondary' : 'inherit'}
                        onClick={doShowWords}
                    >
                        <TextFieldsIcon />
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
