import style from './style.module.css';
import { Outlet, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { SMConfig } from '../../state/smConfig';
import EnterUsername from './EnterUsername';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { Privacy, useRandom } from '@knicos/genai-base';
import { appConfiguration } from '@genaism/state/settingsState';
import BlockDialog from '../dialogs/BlockDialog/BlockDialog';
import LangSelect from '@genaism/components/LangSelect/LangSelect';
import { contentLoaded, currentUserName } from '@genaism/state/sessionState';
import FeedProtocol from './FeedProtocol';
import { TabBlocker } from '@genaism/hooks/duplicateTab';
import { ContentLoader } from '@genaism/components/ContentLoader';
import AppNavigation from './AppNavigation';
import gitInfo from '../../generatedGitInfo.json';

export function Component() {
    const { code } = useParams();
    const config = useRecoilValue<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [username, setUsername] = useRecoilState<string | undefined>(currentUserName);
    const setContentLoaded = useSetRecoilState(contentLoaded);

    const MYCODE = useRandom(10);

    const doLoaded = useCallback(() => {
        setContentLoaded(true);
    }, [setContentLoaded]);

    return (
        <>
            <FeedProtocol
                content={content}
                setContent={setContent}
                server={code}
                mycode={MYCODE}
            >
                <main className={style.page}>
                    {config && !username && (
                        <div className={style.language}>
                            <LangSelect />
                        </div>
                    )}
                    {config && !username && (
                        <>
                            <EnterUsername
                                onUsername={(name: string) => {
                                    setUsername(name);
                                }}
                                autoUsername={config.automaticUsername}
                            />
                            <Privacy
                                appName="somekone"
                                tag={gitInfo.gitTag || 'notag'}
                            />
                        </>
                    )}
                    {config && username && (
                        <>
                            <Outlet />
                            <BlockDialog />
                            {!config.hideActionsButton && <AppNavigation code={MYCODE} />}
                        </>
                    )}
                </main>
            </FeedProtocol>
            <ContentLoader
                content={content}
                onLoaded={doLoaded}
                noConfig
                noSession
            />
            <ErrorDialog />
            <TabBlocker />
        </>
    );
}
