import style from './style.module.css';
import { useParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';
import { useCallback, useEffect, useRef, useState } from 'react';
import usePeer from '../../hooks/peer';
import { SMConfig } from './smConfig';
import EnterUsername from './EnterUsername';
import { EventProtocol } from '../../protocol/protocol';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { getActionLogSince, getCurrentUser, getUserProfile } from '@genaism/services/profiler/profiler';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import Loading from '@genaism/components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import SpeedMenu from './SpeedMenu';
import DataPage from './DataPage';
import ProfilePage from './ProfilePage';
import { useRecoilValue } from 'recoil';
import { menuShowFeedActions } from '@genaism/state/menuState';
import useRandom from '@genaism/hooks/random';
import SharePage from './SharePage';
import { DataConnection } from 'peerjs';

export function Component() {
    const { t } = useTranslation();
    const { code } = useParams();
    const [config, setConfig] = useState<SMConfig>();
    const [username, setUsername] = useState<string>();
    const logRef = useRef(0);
    const logTimer = useRef(-1);
    const showFeedActions = useRecoilValue(menuShowFeedActions);
    // const { onTouchStart, onTouchMove, onTouchEnd, swipe, distance } = useSwipe();
    const MYCODE = useRandom(10);

    const onData = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            console.log('GOT DATA', data);
            if (data.event === 'eter:config' && data.configuration) {
                setConfig(data.configuration);
                // For direct profile viewing connections
            } else if (data.event === 'eter:join') {
                const profile = getUserProfile();
                const logs = getActionLogSince(Date.now() - 5 * 60 * 1000).filter((a) => a.timestamp <= logRef.current);
                conn.send({ event: 'eter:config', configuration: config });
                conn.send({ event: 'eter:reguser', username, id: getCurrentUser() });
                conn.send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
                conn.send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
            }
        },
        [config, username]
    );

    const { ready, send } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    useEffect(() => {
        if (username && send) {
            send({ event: 'eter:reguser', username, id: getCurrentUser() });
        }
    }, [username, send]);

    const doLog = useCallback(() => {
        if (send && logTimer.current === -1) {
            logTimer.current = window.setTimeout(() => {
                logTimer.current = -1;
                const logs = getActionLogSince(logRef.current);
                logRef.current = Date.now();
                send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
            }, 500);
        }
    }, [send]);

    const doProfile = useCallback(
        (profile: ProfileSummary) => {
            if (send) {
                send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
            }
        },
        [send]
    );

    return (
        <>
            <Loading
                loading={!!code && (!ready || !config)}
                message={t('feed.messages.loading')}
            >
                <div className={style.page}>
                    {config && !username && <EnterUsername onUsername={setUsername} />}
                    {config && username && (
                        <>
                            <Feed
                                content={config.content}
                                onProfile={doProfile}
                                onLog={doLog}
                            />
                            {showFeedActions && (
                                <div className={style.speedContainer}>
                                    <SpeedMenu />
                                </div>
                            )}
                        </>
                    )}
                    <SharePage code={MYCODE} />
                    <DataPage />
                    <ProfilePage />
                </div>
            </Loading>
            <ErrorDialog />
        </>
    );
}
