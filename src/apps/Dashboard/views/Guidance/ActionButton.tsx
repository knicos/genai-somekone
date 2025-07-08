import { GuidanceAction } from '@genaism/hooks/guidance';
import { appConfiguration } from '@genaism/common/state/configState';
import { IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useAtom, useSetAtom } from 'jotai';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import QrCode2Icon from '@mui/icons-material/QrCode2';
import { menuShowShare } from '@genaism/apps/Dashboard/state/menuState';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { saveFile } from '@genaism/services/saver/fileSaver';
import { useSettingSerialise } from '@genaism/hooks/settings';
import { useServices } from '@genaism/hooks/services';

interface Props {
    action: GuidanceAction;
    onAction?: () => void;
}

export default function ActionButton({ action, onAction }: Props) {
    const [config, setConfig] = useAtom(appConfiguration);
    const setShowShare = useSetAtom(menuShowShare);
    const serial = useSettingSerialise();
    const { content: contentSvc, profiler: profilerSvc, actionLog } = useServices();

    const doSave = useCallback(async () => {
        saveFile(profilerSvc, contentSvc, actionLog, {
            includeContent: false,
            includeProfiles: true,
            includeLogs: true,
            includeGraph: true,
            configuration: config,
            settings: await serial(),
        });
    }, [config, profilerSvc, contentSvc, actionLog, serial]);

    const doClick = useCallback(() => {
        if (onAction) onAction();
        if (action === 'pause') {
            setConfig((old) => ({ ...old, disableFeedApp: !old.disableFeedApp }));
        } else if (action === 'sharecode') {
            setShowShare((old) => !old);
        } else if (action === 'download') {
            doSave();
        }
    }, [action, setConfig, setShowShare, onAction, doSave]);

    return (
        <IconButton
            onClick={doClick}
            color="secondary"
            data-testid="action-button"
        >
            {action === 'pause' && config.disableFeedApp && <PlayArrowIcon data-testid="paused-app" />}
            {action === 'pause' && !config.disableFeedApp && <PauseIcon />}
            {action === 'sharecode' && <QrCode2Icon />}
            {action === 'download' && <SaveAltIcon />}
        </IconButton>
    );
}
