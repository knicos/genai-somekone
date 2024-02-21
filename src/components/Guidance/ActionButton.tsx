import { GuidanceAction } from '@genaism/services/guidance/guidanceTypes';
import { appConfiguration } from '@genaism/state/settingsState';
import { IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useRecoilState, useSetRecoilState } from 'recoil';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { menuShowShare } from '@genaism/state/menuState';

interface Props {
    action: GuidanceAction;
}

export default function ActionButton({ action }: Props) {
    const [config, setConfig] = useRecoilState(appConfiguration);
    const setShowShare = useSetRecoilState(menuShowShare);

    const doClick = useCallback(() => {
        if (action === 'pause') {
            setConfig((old) => ({ ...old, disableFeedApp: !old.disableFeedApp }));
        } else if (action === 'sharecode') {
            setShowShare((old) => !old);
        }
    }, [action, setConfig, setShowShare]);

    return (
        <IconButton
            onClick={doClick}
            color="secondary"
        >
            {action === 'pause' && config.disableFeedApp && <PlayArrowIcon />}
            {action === 'pause' && !config.disableFeedApp && <PauseIcon />}
            {action === 'sharecode' && <QrCode2Icon />}
        </IconButton>
    );
}
