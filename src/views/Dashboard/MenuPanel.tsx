import { IconButton } from '@mui/material';
import style from './style.module.css';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import ShareIcon from '@mui/icons-material/Share';
import { useCallback } from 'react';

interface Props {
    onOpen?: (data: Blob) => void;
    onShowShare?: () => void;
}

export default function MenuPanel({ onOpen, onShowShare }: Props) {
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
                    color="inherit"
                    onClick={onShowShare}
                >
                    <ShareIcon />
                </IconButton>
                <IconButton
                    color="inherit"
                    onClick={openFile}
                >
                    <DriveFolderUploadIcon />
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
