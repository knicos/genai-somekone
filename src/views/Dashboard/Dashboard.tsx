import { useState, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SMConfig } from '../Genagram/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import usePeer from '../../hooks/peer';
import { DataConnection } from 'peerjs';
import QRCode from '../../components/QRCode/QRCode';
import style from './style.module.css';
import { EventProtocol } from '../../protocol/protocol';
import { Button } from '@mui/material';
import randomId from '../../util/randomId';
import { useTranslation, Trans } from 'react-i18next';
import Graph from '@genaism/components/Graph/Graph';
import { loadFile } from '@genaism/services/loader/fileLoader';
import { useRecoilCallback } from 'recoil';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { cachedProfiles } from '@genaism/state/state';
import ProfileNode from '@genaism/components/ProfileNode/ProfileNode';

interface UserInfo {
    username: string;
    connection: DataConnection;
    id: string;
}

const MYCODE = randomId(5);

export function Component() {
    const { t } = useTranslation();
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
        const configParam = params.get('c');
        if (configParam) {
            const component = decompressFromEncodedURIComponent(configParam);
            const configObj = JSON.parse(component) as SMConfig;
            // TODO: Validate the config
            setConfig(configObj);

            // Also load the content locally to have the images, topics and users.
            const url = configObj.content || 'https://tmstore.blob.core.windows.net/projects/smTestContent1.zip';
            fetch(url).then(async (result) => {
                if (result.status !== 200) {
                    console.error(result);
                    return;
                }
                await loadFile(await result.blob());
            });
        }
    }, [params]);

    const doStart = useCallback(() => setShowStartDialog(false), []);

    return ready ? (
        <main className={style.dashboard}>
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
                <div className={style.groupedItems}>
                    <div className={style.connectMessage}>
                        <QRCode url={`${window.location.origin}/feed/${MYCODE}`} />
                        <div>
                            <Trans
                                values={{ linkText: window.location.host, codeText: MYCODE }}
                                i18nKey="dashboard.messages.connection"
                                components={{
                                    PageLink: (
                                        <a
                                            href={`${window.location.origin}`}
                                            target="_blank"
                                            rel="noreferrer"
                                        />
                                    ),
                                    Code: <em />,
                                }}
                            />
                        </div>
                    </div>
                    <div className={style.userListing}>
                        {users.length === 0 && <div>{t('dashboard.messages.waitingPeople')}</div>}
                        {users.length === 1 && <div>{t('dashboard.messages.onePerson', { count: users.length })}</div>}
                        {users.length > 1 && <div>{t('dashboard.messages.manyPeople', { count: users.length })}</div>}
                        <Button
                            variant="contained"
                            color="secondary"
                            data-testid="dashboard-start-button"
                            onClick={doStart}
                        >
                            {t('dashboard.actions.start')}
                        </Button>
                    </div>
                </div>
            )}
        </main>
    ) : (
        <div></div>
    );
}
