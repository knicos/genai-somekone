import style from './style.module.css';
import { useParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';
import { useCallback, useEffect, useRef, useState } from 'react';
import usePeer from '../../hooks/peer';
import { SMConfig } from './smConfig';
import EnterUsername from './EnterUsername';
import { EventProtocol } from '../../protocol/protocol';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import {
    appendActionLog,
    getActionLogSince,
    getCurrentUser,
    getUserProfile,
    setUserName,
    updateProfile,
} from '@genaism/services/profiler/profiler';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import Loading from '@genaism/components/Loading/Loading';
import { useTranslation } from 'react-i18next';
import SpeedMenu from './SpeedMenu';
import DataPage from './DataPage';
import ProfilePage from './ProfilePage';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { menuShowFeedActions } from '@genaism/state/menuState';
import useRandom from '@genaism/hooks/random';
import SharePage from './SharePage';
import { DataConnection } from 'peerjs';
import { appConfiguration } from '@genaism/state/settingsState';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import RecommendationPage from './RecommendationPage';
import BlockDialog from '../dialogs/BlockDialog/BlockDialog';
import { LogProvider } from '@genaism/hooks/logger';
import { addEdges } from '@genaism/services/graph/edges';
import { addNodes } from '@genaism/services/graph/nodes';
import LangSelect from '@genaism/components/LangSelect/LangSelect';
import { availableUsers } from '@genaism/state/sessionState';

const USERNAME_KEY = 'genai_somekone_username';

function loadUser() {
    const name = window.sessionStorage.getItem(USERNAME_KEY);
    return name || undefined;
}

export function Component() {
    const { t } = useTranslation();
    const { code } = useParams();
    const [config, setConfig] = useRecoilState<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [username, setUsername] = useState<string | undefined>(loadUser);
    const logRef = useRef(0);
    const logTimer = useRef(-1);
    const showFeedActions = useRecoilValue(menuShowFeedActions);
    // const { onTouchStart, onTouchMove, onTouchEnd, swipe, distance } = useSwipe();
    const MYCODE = useRandom(10);
    const setAvailableUsers = useSetRecoilState(availableUsers);

    const onData = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            // console.log('GOT DATA', data);
            if (data.event === 'eter:config' && data.configuration) {
                setConfig((old) => ({ ...old, ...data.configuration }));
                if (data.content) setContent(data.content);
            } else if (data.event === 'eter:users') {
                setAvailableUsers(data.users);
            } else if (data.event === 'eter:profile_data') {
                updateProfile(data.id, data.profile);
            } else if (data.event === 'eter:action_log') {
                appendActionLog(data.log, data.id);
            } else if (data.event === 'eter:join') {
                const profile = getUserProfile();
                const logs = getActionLogSince(Date.now() - 5 * 60 * 1000).filter((a) => a.timestamp <= logRef.current);
                conn.send({ event: 'eter:config', configuration: config, content });
                conn.send({ event: 'eter:reguser', username, id: getCurrentUser() });
                conn.send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
                conn.send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
                conn.send({ event: 'eter:connect', code: `sm-${code}` });
            } else if (data.event === 'eter:snapshot' && data.snapshot) {
                addNodes(data.snapshot.nodes);
                addEdges(data.snapshot.edges.map((e) => ({ ...e, timestamp: Date.now(), metadata: {} })));
            }
        },
        [config, username, content, code, setConfig, setAvailableUsers]
    );

    const { ready, send } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    useEffect(() => {
        if (username && send && ready) {
            window.sessionStorage.setItem(USERNAME_KEY, username);
            setUserName(getCurrentUser(), username);
            send({ event: 'eter:reguser', username, id: getCurrentUser() });
        }
    }, [username, send, ready]);

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

    const doRecommend = useCallback(
        (recommendations: ScoredRecommendation[]) => {
            if (send) {
                send({ event: 'eter:recommendations', recommendations, id: getCurrentUser() });
                send({ event: 'eter:snapshot', id: getCurrentUser() });
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
                <LogProvider sender={send}>
                    <div className={style.page}>
                        {config && !username && (
                            <div className={style.language}>
                                <LangSelect />
                            </div>
                        )}
                        {config && !username && <EnterUsername onUsername={setUsername} />}
                        {config && username && (
                            <>
                                <Feed
                                    content={content}
                                    onProfile={doProfile}
                                    onRecommend={doRecommend}
                                    onLog={doLog}
                                />
                                {showFeedActions && !config.hideActionsButton && (
                                    <div className={style.speedContainer}>
                                        <SpeedMenu />
                                    </div>
                                )}
                            </>
                        )}
                        <SharePage code={MYCODE} />
                        <DataPage />
                        <ProfilePage />
                        <RecommendationPage />
                        <BlockDialog />
                    </div>
                </LogProvider>
            </Loading>
            <ErrorDialog />
        </>
    );
}
