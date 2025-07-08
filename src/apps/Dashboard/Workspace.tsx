import { useState, useEffect, useCallback } from 'react';
import { SMConfig } from '../../common/state/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import style from './style.module.css';
import StartDialog from './views/StartDialog/StartDialog';
import DEFAULT_CONFIG from '@genaism/common/state/defaultConfig.json';
import MenuPanel from './AppMenu/MenuPanel';
import { useAtomValue, useSetAtom } from 'jotai';
import { menuShowReplay } from '@genaism/apps/Dashboard/state/menuState';
import SettingsDialog from './views/SettingsDialog/SettingsDialog';
import Loading from '@genaism/common/components/Loading/Loading';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/common/state/errorState';
import { appConfiguration } from '@genaism/common/state/configState';
import { useID } from '@genai-fi/base';
import Replay from './components/Replay/Replay';
import { onlineUsers } from '@genaism/common/state/sessionState';
import ServerProtocol from '../../protocol/ServerProtocol';
import { ContentLoader } from '@genaism/common/components/ContentLoader';
import Guidance from '@genaism/apps/Dashboard/views/Guidance/Guidance';
import { Outlet } from 'react-router-dom';
import AppSettingsDialog from './views/AppSettingsDialog/AppSettingsDialog';
import RecomSettingsDialog from './views/RecomSettingsDialog/RecomSettingsDialog';
import { SomekoneSettings, useSettingDeserialise } from '@genaism/hooks/settings';
import Simulator from './components/Simulator/Simulator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@genaism/i18n';
import { guideFile } from './state/settingsState';
import { Peer } from '@genai-fi/base/hooks/peer';

interface Props {
    contentUrls?: string;
    cfg?: string;
    guide?: string;
    experimental?: boolean;
    noSession?: boolean;
}

export function Workspace({ contentUrls, cfg, guide, experimental, noSession }: Props) {
    const setConfig = useSetAtom(appConfiguration);
    const [content, setContent] = useState<(ArrayBuffer | string)[]>();
    const users = useAtomValue(onlineUsers);
    const [loaded, setLoaded] = useState(false);
    const setError = useSetAtom(errorNotification);
    const MYCODE = useID(5);
    const deserial = useSettingDeserialise();
    const gfile = useAtomValue(guideFile);

    const [ready, setReady] = useState(false);
    const showReplay = useAtomValue(menuShowReplay);
    const [fileToOpen, setFileToOpen] = useState<(ArrayBuffer | string)[] | undefined>();

    useEffect(() => {
        if (!ready) return;
        setConfig({ ...(DEFAULT_CONFIG.configuration as SMConfig), experimental });
        let contentObj: (ArrayBuffer | string)[] = DEFAULT_CONFIG.content;
        const configParam = cfg;
        if (configParam) {
            const component = decompressFromEncodedURIComponent(configParam);
            const configObj: SomekoneSettings = { ...(JSON.parse(component) as SomekoneSettings) };
            // TODO: Validate the config
            deserial(configObj);
        }

        const contentParam = contentUrls;
        if (contentParam) {
            const component = decompressFromEncodedURIComponent(contentParam);
            contentObj = JSON.parse(component);
        } else if (contentParam === '') {
            contentObj = [];
        }

        setContent(contentObj);
        //setConfig(configObj);
    }, [contentUrls, cfg, ready, setConfig, setError, experimental, deserial]);

    const doOpenFile = useCallback((data: Blob) => {
        data.arrayBuffer().then((c) => {
            setFileToOpen([c]);
        });
    }, []);

    const doLoaded = useCallback(() => {
        setLoaded(true);
    }, []);

    const doReady = useCallback((r: boolean) => {
        if (r) setReady(true);
    }, []);

    return (
        <Peer
            host={import.meta.env.VITE_APP_PEER_SERVER}
            secure={import.meta.env.VITE_APP_PEER_SECURE === '1'}
            peerkey={import.meta.env.VITE_APP_PEER_KEY || 'peerjs'}
            port={import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443}
            code={`sm-${MYCODE}`}
        >
            <Loading loading={!loaded}>
                <I18nextProvider
                    i18n={i18n}
                    defaultNS={'dashboard'}
                >
                    <main className={style.dashboard}>
                        <MenuPanel />
                        {(gfile || guide) && <Guidance guide={gfile ? gfile : guide || ''} />}
                        <section className={style.workspace}>
                            <Outlet />
                            <StartDialog
                                users={users}
                                code={MYCODE}
                            />
                            <SettingsDialog />
                            <AppSettingsDialog />
                            <RecomSettingsDialog />
                            {showReplay && <Replay />}
                            <Simulator />
                        </section>
                    </main>
                </I18nextProvider>
            </Loading>
            <ServerProtocol
                onReady={doReady}
                content={content}
            />
            <ContentLoader
                content={content}
                onLoaded={doLoaded}
                noSession={noSession}
            />
            <ContentLoader content={fileToOpen} />
            <ErrorDialog />
            <input
                type="file"
                id="openfile"
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
                    if (e.currentTarget.files) {
                        doOpenFile(e.currentTarget.files[0]);
                        e.currentTarget.value = '';
                    }
                }}
                hidden={true}
                accept=".zip,application/zip"
            />
        </Peer>
    );
}
