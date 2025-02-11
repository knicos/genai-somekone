import { IconButton, LinearProgress } from '@mui/material';
import { IconMenu, IconMenuItem, Spacer } from '@genaism/common/components/IconMenu';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import StopIcon from '@mui/icons-material/Stop';
import PauseIcon from '@mui/icons-material/Pause';
import { useTranslation } from 'react-i18next';
import { useEffect } from 'react';
import { useServiceEventMemo, useServices } from '@genaism/hooks/services';
import style from './style.module.css';
import { useRecoilValue } from 'recoil';
import { menuReplaySpeed, menuShowReplayControls } from '@genaism/apps/Dashboard/state/menuState';
import SpeedMenu from './SpeedMenu';

const HOUR = 1000 * 60 * 60;
const MIN = 1000 * 60;

function prefixZero(v: number) {
    return v < 10 ? `0${v}` : `${v}`;
}

function formatTime(time: number) {
    const hour = Math.floor(time / HOUR);
    const remain1 = time - hour * HOUR;
    const min = Math.floor(remain1 / MIN);
    const remain2 = remain1 - min * MIN;
    const sec = Math.floor(remain2 / 1000);
    return `${prefixZero(hour)}:${prefixZero(min)}:${prefixZero(sec)}`;
}

export default function Replay() {
    const { t } = useTranslation();
    const showControls = useRecoilValue(menuShowReplayControls);
    const speed = useRecoilValue(menuReplaySpeed);
    const { replay: replaySvc } = useServices();

    const [pos, time] = useServiceEventMemo(
        () => [replaySvc.getPosition(), replaySvc.getTime() - replaySvc.getStartTime()],
        [replaySvc],
        'replaystep'
    );
    const active = useServiceEventMemo(
        () => replaySvc.isPlaying(),
        [replaySvc],
        ['replaystart', 'replayfinished', 'replaystop']
    );
    const paused = useServiceEventMemo(() => replaySvc.isPaused(), [replaySvc], ['replaypaused', 'replayunpaused']);

    useEffect(() => {
        replaySvc.speed = speed;
    }, [speed, replaySvc]);

    return (
        <IconMenu
            placement="bottom"
            label={<div style={{ paddingRight: '0.5rem', fontWeight: 'bold' }}>{t('dashboard.titles.replay')}</div>}
        >
            {showControls && (
                <>
                    <IconMenuItem
                        tooltip={t('dashboard.labels.play')}
                        selected={active && !paused}
                    >
                        <IconButton
                            onClick={() => {
                                if (active) {
                                    replaySvc.pause();
                                } else {
                                    replaySvc.speed = speed;
                                    replaySvc.start();
                                }
                            }}
                            color="inherit"
                        >
                            {active ? paused ? <PlayArrowIcon /> : <PauseIcon /> : <PlayArrowIcon />}
                        </IconButton>
                    </IconMenuItem>
                    <IconMenuItem tooltip={t('dashboard.labels.stop')}>
                        <IconButton
                            color="inherit"
                            disabled={!active}
                            onClick={() => replaySvc.stop()}
                        >
                            <StopIcon />
                        </IconButton>
                    </IconMenuItem>
                    <SpeedMenu />
                    <Spacer />
                </>
            )}
            <div className={style.progressContainer}>
                <LinearProgress
                    variant="determinate"
                    value={Math.min(100, pos * 100)}
                    style={{ width: '200px' }}
                />
                <div className={style.timeContainer}>{formatTime(time)}</div>
            </div>
        </IconMenu>
    );
}
