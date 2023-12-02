import { useState, useEffect, useCallback } from 'react';
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
import { useSetRecoilState } from 'recoil';
import { menuShowShare } from '@genaism/state/menuState';
import SaveDialog from '../dialogs/SaveDialog/SaveDialog';
import SettingsDialog from '../dialogs/SettingsDialog/SettingsDialog';
import Loading from '@genaism/components/Loading/Loading';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/state/errorState';
import useRandom from '@genaism/hooks/random';

export function Component() {
    const [params] = useSearchParams();
    const [config, setConfig] = useState<SMConfig | null>(null);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const setShowStartDialog = useSetRecoilState(menuShowShare);
    const [loaded, setLoaded] = useState(false);
    const setError = useSetRecoilState(errorNotification);
    const MYCODE = useRandom(5);

    const dataHandler = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            console.log('GOT DATA', data);
            if (data.event === 'eter:join') {
                conn.send({ event: 'eter:config', configuration: config });
            } else if (data.event === 'eter:reguser') {
                setUserName(data.id, data.username);
                setUsers((old) => [...old, { id: data.id, username: data.username, connection: conn }]);
            } else if (data.event === 'eter:close') {
                setUsers((old) => old.filter((o) => o.connection !== conn));
            } else if (data.event === 'eter:profile_data') {
                updateProfile(data.id, data.profile);
            } else if (data.event === 'eter:action_log') {
                appendActionLog(data.log, data.id);
            }
        },
        [config]
    );
    const closeHandler = useCallback((conn?: DataConnection) => {
        if (conn) {
            setUsers((old) => old.filter((o) => o.connection !== conn));
        }
    }, []);

    const { ready } = usePeer({ code: `sm-${MYCODE}`, onData: dataHandler, onClose: closeHandler });

    useEffect(() => {
        let configObj: SMConfig = DEFAULT_CONFIG;
        const configParam = params.get('c');
        if (configParam) {
            const component = decompressFromEncodedURIComponent(configParam);
            configObj = { ...configObj, ...(JSON.parse(component) as SMConfig) };
            // TODO: Validate the config
        }

        if (configObj.content) {
            configObj.content.forEach((c, ix) => {
                getZipBlob(c)
                    .then(async (blob) => {
                        if (configObj.content && blob.arrayBuffer) {
                            configObj.content[ix] = await blob.arrayBuffer();
                        }

                        await loadFile(blob);
                        setConfig(configObj);
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
        }
    }, [params]);

    useEffect(() => {
        if (users.length === 0) {
            setShowStartDialog(true);
        }
    }, [users]);

    useEffect(() => {
        if (ready && config) setLoaded(true);
    }, [ready, config]);

    const doOpenFile = useCallback(
        (data: Blob) => {
            data.arrayBuffer().then((content) => {
                const configObj = { ...config, content: [...(config?.content || []), content] };
                setConfig(configObj);

                // TODO: Allow an optional graph reset here.
                loadFile(data);
            });
        },
        [config]
    );

    return (
        <>
            <Loading loading={!loaded}>
                <main className={style.dashboard}>
                    <section className={style.workspace}>
                        <SocialGraph liveUsers={users.map((u) => u.id)} />

                        <StartDialog
                            users={users}
                            code={MYCODE}
                        />
                    </section>
                    <MenuPanel onOpen={doOpenFile} />
                    <SaveDialog />
                    <SettingsDialog />
                </main>
            </Loading>
            <ErrorDialog />
        </>
    );
}
