import { IconButton } from '@mui/material';
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
import IconMenu from '@genaism/components/IconMenu/IconMenu';
import IconMenuItem from '@genaism/components/IconMenu/Item';
import Spacer from '@genaism/components/IconMenu/Spacer';

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
        <IconMenu
            placement="left"
            label={
                <div className={style.logo}>
                    <img
                        src="/logo48_bw_invert.png"
                        width="48"
                        height="48"
                    />
                </div>
            }
        >
            <IconMenuItem tooltip={t('dashboard.labels.shareTip')}>
                <IconButton
                    color={showShare ? 'secondary' : 'inherit'}
                    onClick={doShowShare}
                >
                    <ShareIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.openTip')}>
                <IconButton
                    color="inherit"
                    onClick={openFile}
                >
                    <DriveFolderUploadIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.saveTip')}>
                <IconButton
                    color={showSave ? 'secondary' : 'inherit'}
                    onClick={doShowSave}
                >
                    <SaveAltIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.showSocialGraph')}>
                <IconButton
                    color={graphMode === 'social' ? 'secondary' : 'inherit'}
                    onClick={() => setGraphMode('social')}
                >
                    <PeopleIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.showContentGraph')}>
                <IconButton
                    color={graphMode === 'content' ? 'secondary' : 'inherit'}
                    onClick={() => setGraphMode('content')}
                >
                    <CollectionsIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.showTopicGraph')}>
                <IconButton
                    color={graphMode === 'topic' ? 'secondary' : 'inherit'}
                    onClick={() => setGraphMode('topic')}
                >
                    <TextFieldsIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.refreshGraph')}>
                <IconButton
                    color={'inherit'}
                    onClick={onRefresh}
                >
                    <RefreshIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip="">
                <IconButton
                    color={showSettings ? 'secondary' : 'inherit'}
                    onClick={doShowSettings}
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
