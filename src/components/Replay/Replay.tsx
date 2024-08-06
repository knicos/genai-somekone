import { IconButton, LinearProgress, ToggleButton, ToggleButtonGroup } from '@mui/material';
import IconMenu from '../IconMenu/IconMenu';
import IconMenuItem from '../IconMenu/Item';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import Spacer from '../IconMenu/Spacer';
import { useServices } from '@genaism/hooks/services';

export default function Replay() {
    const { t } = useTranslation();
    const [speed, setSpeed] = useState(4);
    const { replay: replaySvc } = useServices();

    const active = replaySvc.isPlaying();
    const paused = replaySvc.isPaused();

    return (
        <IconMenu placement="bottom">
            <IconMenuItem tooltip={t('dashboard.labels.play')}>
                <IconButton onClick={() => active && replaySvc.pause()}>
                    {active ? paused ? <PlayArrowIcon /> : <PauseIcon /> : <PlayArrowIcon />}
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.stop')}>
                <IconButton
                    disabled={!active}
                    onClick={() => stop()}
                >
                    <StopIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <LinearProgress
                variant="determinate"
                value={replaySvc.getPosition() * 100}
                style={{ width: '200px' }}
            />
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.playbackSpeed')}>
                <ToggleButtonGroup
                    value={speed}
                    exclusive
                    onChange={(_, newValue) => setSpeed(newValue)}
                >
                    <ToggleButton value={1}>1x</ToggleButton>
                    <ToggleButton value={2}>2x</ToggleButton>
                    <ToggleButton value={4}>4x</ToggleButton>
                    <ToggleButton value={8}>8x</ToggleButton>
                </ToggleButtonGroup>
            </IconMenuItem>
        </IconMenu>
    );
}
