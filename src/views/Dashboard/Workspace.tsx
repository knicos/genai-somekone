import { useState, useEffect, useCallback } from 'react';
import { SMConfig } from '../../state/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import style from './style.module.css';
import StartDialog from '../dialogs/StartDialog/StartDialog';
import DEFAULT_CONFIG from '../Genagram/defaultConfig.json';
import MenuPanel from './MenuPanel';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuShowReplay } from '@genaism/state/menuState';
import SaveDialog from '../dialogs/SaveDialog/SaveDialog';
import SettingsDialog from '../dialogs/SettingsDialog/SettingsDialog';
import Loading from '@genaism/components/Loading/Loading';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/state/errorState';
import { appConfiguration } from '@genaism/state/settingsState';
import { useID } from '@knicos/genai-base';
import Replay from '@genaism/components/Replay/Replay';
import { onlineUsers } from '@genaism/state/sessionState';
import ServerProtocol from './ServerProtocol';
import ContentLoader from '@genaism/components/ContentLoader/ContentLoader';
import Guidance from '@genaism/components/Guidance/Guidance';
import { Outlet } from 'react-router';
import AppSettingsDialog from '../dialogs/AppSettingsDialog/AppSettingsDialog';
import RecomSettingsDialog from '../dialogs/RecomSettingsDialog/RecomSettingsDialog';
import { SomekoneSettings, useSettingDeserialise } from '@genaism/hooks/settings';

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

    return (
        <>
            <Loading loading={!loaded}>
                <main className={style.dashboard}>
                    <MenuPanel />
                    {guide && <Guidance guide={guide} />}
                    <section className={style.workspace}>
                        <Outlet />
                        <StartDialog
                            users={users}
                            code={MYCODE}
                            onDemo={() => {
                                setFileToOpen(['https://store.gen-ai.fi/somekone/sm_demo1c.zip']);
                            }}
                        />
                        <SaveDialog />
                        <SettingsDialog />
                        <AppSettingsDialog />
                        <RecomSettingsDialog />
                        {showReplay && <Replay />}
                    </section>
                </main>
            </Loading>
            <ServerProtocol
                onReady={(r: boolean) => {
                    if (r) setReady(true);
                }}
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
