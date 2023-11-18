import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SMConfig } from '../Genagram/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import usePeer from '../../hooks/peer';
import { DataConnection } from 'peerjs';
import style from './style.module.css';
import { EventProtocol } from '../../protocol/protocol';
import randomId from '../../util/randomId';
import Graph from '@genaism/components/Graph/Graph';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { useRecoilCallback } from 'recoil';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { cachedProfiles } from '@genaism/state/state';
import ProfileNode from '@genaism/components/ProfileNode/ProfileNode';
import { UserInfo } from './userInfo';
import StartDialog from './StartDialog';
import DEFAULT_CONFIG from '../Genagram/defaultConfig.json';
import MenuPanel from './MenuPanel';

const MYCODE = randomId(5);

export function Component() {
    const [params] = useSearchParams();
    const [config, setConfig] = useState<SMConfig | null>(null);
    const [users, setUsers] = useState<UserInfo[]>([]);
    const [showStartDialog, setShowStartDialog] = useState(true);
    const setProfile = useRecoilCallback(
        ({ set }) =>
            (id: string, profile: ProfileSummary) => {
                set(cachedProfiles(id), profile);
            },
        []
    );

    const dataHandler = useCallback(
        (data: EventProtocol, conn: DataConnection) => {
            console.log('GOT DATA', data);
            if (data.event === 'eter:join') {
                conn.send({ event: 'eter:config', configuration: config });
            } else if (data.event === 'eter:reguser') {
                setUsers((old) => [...old, { id: data.id, username: data.username, connection: conn }]);
            } else if (data.event === 'eter:close') {
                setUsers((old) => old.filter((o) => o.connection !== conn));
            } else if (data.event === 'eter:profile_data') {
                setProfile(data.id, data.profile);
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
            getZipBlob(configObj.content).then(async (blob) => {
                configObj.content = await blob.arrayBuffer();
                setConfig(configObj);
                await loadFile(blob);
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

    const doOpenFile = useCallback(
        (data: Blob) => {
            data.arrayBuffer().then((content) => {
                const configObj = { ...config, content };
                setConfig(configObj);
                loadFile(data);
            });
        },
        [config]
    );

    const doShowShare = useCallback(() => {
        setShowStartDialog(true);
    }, []);

    const doStart = useCallback(() => setShowStartDialog(false), []);

    return ready ? (
        <main className={style.dashboard}>
            <MenuPanel
                onOpen={doOpenFile}
                onShowShare={doShowShare}
            />
            <section className={style.workspace}>
                <Graph
                    nodes={users.map((u) => ({
                        id: u.username,
                        size: 100,
                        component: (
                            <ProfileNode
                                name={u.username}
                                id={u.id}
                            />
                        ),
                    }))}
                />
                {showStartDialog && (
                    <StartDialog
                        users={users}
                        code={MYCODE}
                        onClose={doStart}
                    />
                )}
            </section>
        </main>
    ) : (
        <div></div>
    );
}
