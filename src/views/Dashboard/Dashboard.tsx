import { useState, useEffect, useCallback, useReducer, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SMConfig } from '../Genagram/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import usePeer from '@genaism/hooks/peer';
import { DataConnection } from 'peerjs';
import style from './style.module.css';
import { EventProtocol } from '@genaism/protocol/protocol';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { UserInfo } from './userInfo';
import StartDialog from '../dialogs/StartDialog/StartDialog';
import DEFAULT_CONFIG from '../Genagram/defaultConfig.json';
import MenuPanel from './MenuPanel';
import { appendActionLog, setUserName, updateProfile } from '@genaism/services/profiler/profiler';
import SocialGraph from '@genaism/components/SocialGraph/SocialGraph';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { menuGraphType, menuShowShare } from '@genaism/state/menuState';
import SaveDialog from '../dialogs/SaveDialog/SaveDialog';
import SettingsDialog from '../dialogs/SettingsDialog/SettingsDialog';
import Loading from '@genaism/components/Loading/Loading';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/state/errorState';
import useRandom from '@genaism/hooks/random';
import { appConfiguration } from '@genaism/state/settingsState';
import TopicGraph from '@genaism/components/TopicGraph/TopicGraph';
import ContentGraph from '@genaism/components/ContentGraph/ContentGraph';
import { appendResearchLog } from '@genaism/services/research/research';
import { makeUserGraphSnapshot } from '@genaism/services/users/users';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

const MAX_AGE = 30 * 60 * 1000; // 30 mins

export function Component() {
    const [params] = useSearchParams();
    const [config, setConfig] = useRecoilState<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(ArrayBuffer | string)[]>();
    const [users, setUsers] = useState<UserInfo[]>([]);
    const setShowStartDialog = useSetRecoilState(menuShowShare);
    const [loaded, setLoaded] = useState(false);
    const setError = useSetRecoilState(errorNotification);
    const MYCODE = useRandom(5);
    const graphMode = useRecoilValue(menuGraphType);
    const [count, refresh] = useReducer((a) => ++a, 0);
    const snapRef = useRef(new Map<UserNodeId, number>());

    const dataHandler = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            // console.log('GOT DATA', data);
            if (data.event === 'eter:join') {
                conn.send({ event: 'eter:config', configuration: config, content });
            } else if (data.event === 'eter:reguser') {
                setUserName(data.id, data.username);
                setUsers((old) => [...old, { id: data.id, username: data.username, connection: conn }]);
            } else if (data.event === 'eter:close') {
                setUsers((old) => old.filter((o) => o.connection !== conn));
            } else if (data.event === 'eter:profile_data') {
                updateProfile(data.id, data.profile);
            } else if (data.event === 'eter:action_log') {
                appendActionLog(data.log, data.id);
            } else if (data.event === 'researchlog') {
                appendResearchLog({
                    action: data.action,
                    timestamp: data.timestamp,
                    details: data.details,
                    userId: data.userId,
                });
            } else if (data.event === 'eter:snapshot') {
                const now = Date.now();
                const time = snapRef.current.get(data.id) || now - MAX_AGE;
                const snap = makeUserGraphSnapshot(data.id, now - time);
                snapRef.current.set(data.id, now);
                conn.send({ event: 'eter:snapshot', id: data.id, snapshot: snap });
            }
        },
        [config, content]
    );
    const closeHandler = useCallback((conn?: DataConnection) => {
        if (conn) {
            setUsers((old) => old.filter((o) => o.connection !== conn));
        }
    }, []);

    const { ready, send } = usePeer({ code: `sm-${MYCODE}`, onData: dataHandler, onClose: closeHandler });

    useEffect(() => {
        if (send) send({ event: 'eter:config', configuration: config });
    }, [config, send]);

    useEffect(() => {
        if (!ready) return;
        let configObj: SMConfig = DEFAULT_CONFIG.configuration;
        let contentObj: (ArrayBuffer | string)[] = DEFAULT_CONFIG.content;
        const configParam = params.get('cfg');
        if (configParam) {
            const component = decompressFromEncodedURIComponent(configParam);
            configObj = { ...configObj, ...(JSON.parse(component) as SMConfig) };
            // TODO: Validate the config
        }

        const contentParam = params.get('content');
        if (contentParam) {
            const component = decompressFromEncodedURIComponent(contentParam);
            contentObj = JSON.parse(component);
        } else if (contentParam === '') {
            contentObj = [];
        }

        if (contentObj && contentObj.length > 0) {
            contentObj.forEach((c) => {
                getZipBlob(c)
                    .then(async (blob) => {
                        /*if (contentObj && blob.arrayBuffer) {
                            contentObj[ix] = await blob.arrayBuffer();
                        }*/

                        try {
                            await loadFile(blob);
                        } catch (e) {
                            console.error(e);
                            setError((p) => {
                                const s = new Set(p);
                                s.add('missing_dependency');
                                return s;
                            });
                        }
                        setConfig(configObj);
                        setContent(contentObj);
                    })
                    .catch((e) => {
                        console.error(e);
                        setError((p) => {
                            const s = new Set(p);
                            s.add('content_not_found');
                            return s;
                        });
                    });
            });
        } else {
            // Show the file open dialog
            setConfig(configObj);
            setContent(contentObj);
        }
    }, [params, ready, setConfig, setError]);

    useEffect(() => {
        if (users.length === 0) {
            setShowStartDialog(true);
        }
    }, [users, setShowStartDialog]);

    useEffect(() => {
        if (ready && content) setLoaded(true);
    }, [ready, content]);

    const doOpenFile = useCallback(
        (data: Blob) => {
            data.arrayBuffer().then((c) => {
                setContent((old) => [...(old || []), c]);

                // TODO: Allow an optional graph reset here.
                loadFile(data).catch((e) => {
                    console.error(e);
                    setError((p) => {
                        const s = new Set(p);
                        s.add('missing_dependency');
                        return s;
                    });
                });
            });
        },
        [setError]
    );

    return (
        <>
            <Loading loading={!loaded}>
                <main className={style.dashboard}>
                    <section className={style.workspace}>
                        <div className={style.backgroundLogo}>
                            <img
                                src="/logo64_bw.png"
                                width={64}
                                height={64}
                            />
                            <h1>Somekone</h1>
                        </div>
                        {graphMode === 'social' && (
                            <SocialGraph
                                key={`sg-${count}`}
                                liveUsers={users.map((u) => u.id)}
                            />
                        )}
                        {graphMode === 'topic' && <TopicGraph key={`tg-${count}`} />}
                        {graphMode === 'content' && <ContentGraph key={`cg-${count}`} />}

                        <StartDialog
                            users={users}
                            code={MYCODE}
                        />
                    </section>
                    <MenuPanel
                        onOpen={doOpenFile}
                        onRefresh={refresh}
                    />
                    <SaveDialog />
                    <SettingsDialog />
                </main>
            </Loading>
            <ErrorDialog />
        </>
    );
}
