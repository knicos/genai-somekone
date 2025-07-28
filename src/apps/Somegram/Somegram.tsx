import style from './style.module.css';
import { Outlet, useParams } from 'react-router-dom';
import { useCallback, useState } from 'react';
import { SMConfig } from '../../common/state/smConfig';
import EnterUsername from '../../common/components/EnterUsername/EnterUsername';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { useAtom, useAtomValue, useSetAtom } from 'jotai';
import { Privacy, useRandom } from '@genai-fi/base';
import { appConfiguration } from '@genaism/common/state/configState';
import BlockDialog from '../../common/views/BlockDialog/BlockDialog';
import LangSelect from '@genaism/common/components/LangSelect/LangSelect';
import { contentLoaded, currentUserName } from '@genaism/common/state/sessionState';
import FeedProtocol from '../../protocol/FeedProtocol';
import { TabBlocker } from '@genaism/hooks/duplicateTab';
import { ContentLoader } from '@genaism/common/components/ContentLoader';
import AppNavigation from './AppNavigation';
import gitInfo from '../../generatedGitInfo.json';
import { Peer } from '@genai-fi/base/hooks/peer';
import PeerEnv from '@genaism/env';

export function Component() {
    const { code } = useParams();
    const config = useAtomValue<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [username, setUsername] = useAtom<string | undefined>(currentUserName);
    const setContentLoaded = useSetAtom(contentLoaded);

    const MYCODE = useRandom(5);

    const doLoaded = useCallback(() => {
        setContentLoaded(true);
    }, [setContentLoaded]);

    return (
        <Peer
            host={PeerEnv.host}
            secure={PeerEnv.secure}
            peerkey={PeerEnv.peerkey}
            port={PeerEnv.port}
            server={`sm-${code}`}
            code={`sm-${MYCODE}`}
        >
            <FeedProtocol
                content={content}
                setContent={setContent}
                server={code}
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
        </Peer>
    );
}
