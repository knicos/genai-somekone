import { IconButton, Tooltip } from '@mui/material';
import style from './style.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import CollectionsIcon from '@mui/icons-material/Collections';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import ShareIcon from '@mui/icons-material/Share';
import PeopleIcon from '@mui/icons-material/People';
import RefreshIcon from '@mui/icons-material/Refresh';
import { useCallback } from 'react';
import { useRecoilState } from 'recoil';
import { menuGraphType, menuShowSave, menuShowSettings, menuShowShare } from '@genaism/state/menuState';
import { useTranslation } from 'react-i18next';

interface Props {
    onOpen?: (data: Blob) => void;
    onRefresh?: () => void;
}

export default function MenuPanel({ onOpen, onRefresh }: Props) {
    const { t } = useTranslation();
    const [showShare, setShowShare] = useRecoilState(menuShowShare);
    const [showSettings, setShowSettings] = useRecoilState(menuShowSettings);
    const [showSave, setShowSave] = useRecoilState(menuShowSave);
    const [graphMode, setGraphMode] = useRecoilState(menuGraphType);

    const doShowShare = useCallback(() => setShowShare((s) => !s), [setShowShare]);
    const doShowSettings = useCallback(() => setShowSettings((s) => !s), [setShowSettings]);
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
                    title={t('dashboard.labels.showSocialGraph')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={graphMode === 'social' ? 'secondary' : 'inherit'}
                        onClick={() => setGraphMode('social')}
                    >
                        <PeopleIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.showContentGraph')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={graphMode === 'content' ? 'secondary' : 'inherit'}
                        onClick={() => setGraphMode('content')}
                    >
                        <CollectionsIcon />
                    </IconButton>
                </Tooltip>
                <Tooltip
                    title={t('dashboard.labels.showTopicGraph')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={graphMode === 'topic' ? 'secondary' : 'inherit'}
                        onClick={() => setGraphMode('topic')}
                    >
                        <TextFieldsIcon />
                    </IconButton>
                </Tooltip>
                <div className={style.menuSpacer} />
                <Tooltip
                    title={t('dashboard.labels.refreshGraph')}
                    arrow
                    placement="right"
                >
                    <IconButton
                        color={'inherit'}
                        onClick={onRefresh}
                    >
                        <RefreshIcon />
                    </IconButton>
                </Tooltip>
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
