import { useState, useEffect, useCallback } from 'react';
import { SMConfig } from '../../common/state/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import style from './style.module.css';
import StartDialog from './views/StartDialog/StartDialog';
import DEFAULT_CONFIG from '@genaism/common/state/defaultConfig.json';
import MenuPanel from './AppMenu/MenuPanel';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuShowReplay } from '@genaism/apps/Dashboard/state/menuState';
import SettingsDialog from './views/SettingsDialog/SettingsDialog';
import Loading from '@genaism/common/components/Loading/Loading';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/common/state/errorState';
import { appConfiguration } from '@genaism/common/state/configState';
import { useID } from '@knicos/genai-base';
import Replay from './components/Replay/Replay';
import { onlineUsers } from '@genaism/common/state/sessionState';
import ServerProtocol from '../../protocol/ServerProtocol';
import { ContentLoader } from '@genaism/common/components/ContentLoader';
import Guidance from '@genaism/apps/Dashboard/views/Guidance/Guidance';
import { Outlet } from 'react-router';
import AppSettingsDialog from './views/AppSettingsDialog/AppSettingsDialog';
import RecomSettingsDialog from './views/RecomSettingsDialog/RecomSettingsDialog';
import { SomekoneSettings, useSettingDeserialise } from '@genaism/hooks/settings';
import Simulator from './components/Simulator/Simulator';
import { I18nextProvider } from 'react-i18next';
import i18n from '@genaism/i18n';
import { guideFile } from './state/settingsState';

interface Props {
    contentUrls?: string;
    cfg?: string;
    guide?: string;
    experimental?: boolean;
    noSession?: boolean;
}

export function Workspace({ contentUrls, cfg, guide, experimental, noSession }: Props) {
    const setConfig = useSetRecoilState<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(ArrayBuffer | string)[]>();
    const users = useRecoilValue(onlineUsers);
    const [loaded, setLoaded] = useState(false);
    const setError = useSetRecoilState(errorNotification);
    const MYCODE = useID(5);
    const deserial = useSettingDeserialise();
    const gfile = useRecoilValue(guideFile);

    const [ready, setReady] = useState(false);
    const showReplay = useRecoilValue(menuShowReplay);
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
        <>
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
                code={MYCODE}
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
        </>
    );
}
