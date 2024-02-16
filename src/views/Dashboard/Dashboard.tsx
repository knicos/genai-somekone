import { useState, useEffect, useCallback, useReducer } from 'react';
import { useSearchParams } from 'react-router-dom';
import { SMConfig } from '../Genagram/smConfig';
import { decompressFromEncodedURIComponent } from 'lz-string';
import style from './style.module.css';
import StartDialog from '../dialogs/StartDialog/StartDialog';
import DEFAULT_CONFIG from '../Genagram/defaultConfig.json';
import MenuPanel from './MenuPanel';
import SocialGraph from '@genaism/components/SocialGraph/SocialGraph';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuGraphType, menuSelectedUser, menuShowReplay } from '@genaism/state/menuState';
import SaveDialog from '../dialogs/SaveDialog/SaveDialog';
import SettingsDialog from '../dialogs/SettingsDialog/SettingsDialog';
import Loading from '@genaism/components/Loading/Loading';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { errorNotification } from '@genaism/state/errorState';
import { appConfiguration } from '@genaism/state/settingsState';
import TopicGraph from '@genaism/components/TopicGraph/TopicGraph';
import ContentGraph from '@genaism/components/ContentGraph/ContentGraph';
import { useID } from '@genaism/hooks/id';
import UserGrid from '@genaism/components/UserGrid/UserGrid';
import Replay from '@genaism/components/Replay/Replay';
import { onlineUsers } from '@genaism/state/sessionState';
import ServerProtocol from './ServerProtocol';
import ContentLoader from '@genaism/components/ContentLoader/ContentLoader';

export function Component() {
    const [params] = useSearchParams();
    const setConfig = useSetRecoilState<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(ArrayBuffer | string)[]>();
    const users = useRecoilValue(onlineUsers);
    const [loaded, setLoaded] = useState(false);
    const setError = useSetRecoilState(errorNotification);
    const MYCODE = useID(5);
    const graphMode = useRecoilValue(menuGraphType);
    const [count, refresh] = useReducer((a) => ++a, 0);
    const [ready, setReady] = useState(false);
    const showReplay = useRecoilValue(menuShowReplay);
    const setSelectedNode = useSetRecoilState(menuSelectedUser);
    const [fileToOpen, setFileToOpen] = useState<(ArrayBuffer | string)[] | undefined>();

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

        setContent(contentObj);
        setConfig(configObj);
    }, [params, ready, setConfig, setError]);

    const doOpenFile = useCallback((data: Blob) => {
        data.arrayBuffer().then((c) => {
            setFileToOpen([c]);
        });
    }, []);

    const doLoaded = useCallback(() => {
        setLoaded(true);
    }, []);

    // Always unselect user when changing graphs.
    useEffect(() => {
        setSelectedNode(undefined);
    }, [graphMode, setSelectedNode]);

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
                                alt="Somekone logo"
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
                        {graphMode === 'grid' && <UserGrid key={`ug-${count}`} />}

                        <StartDialog
                            users={users}
                            code={MYCODE}
                            onDemo={() => {
                                setFileToOpen(['https://tmstore.blob.core.windows.net/projects/sm_demo1b.zip']);
                            }}
                        />
                    </section>
                    <MenuPanel
                        onOpen={doOpenFile}
                        onRefresh={refresh}
                    />
                    <SaveDialog />
                    <SettingsDialog />
                    {showReplay && <Replay />}
                </main>
            </Loading>
            <ServerProtocol
                onReady={setReady}
                content={content}
                code={MYCODE}
            />
            <ContentLoader
                content={content}
                onLoaded={doLoaded}
            />
            <ContentLoader content={fileToOpen} />
            <ErrorDialog />
        </>
    );
}
