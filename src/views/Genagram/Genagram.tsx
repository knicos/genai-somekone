import style from './style.module.css';
import { useParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';
import { useState } from 'react';
import { SMConfig } from '../../state/smConfig';
import EnterUsername from './EnterUsername';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import SpeedMenu from './SpeedMenu';
import DataPage from './DataPage';
import ProfilePage from './ProfilePage';
import { useRecoilState, useRecoilValue } from 'recoil';
import { menuShowFeedActions } from '@genaism/state/menuState';
import useRandom from '@genaism/hooks/random';
import SharePage from './SharePage';
import { appConfiguration } from '@genaism/state/settingsState';
import RecommendationPage from './RecommendationPage';
import BlockDialog from '../dialogs/BlockDialog/BlockDialog';
import LangSelect from '@genaism/components/LangSelect/LangSelect';
import { currentUserName } from '@genaism/state/sessionState';
import FeedProtocol, { useFeedProtocol } from './FeedProtocol';
import { TabBlocker } from '@genaism/hooks/duplicateTab';

function FeedWrapper({ content }: { content?: (string | ArrayBuffer)[] }) {
    const { doProfile, doRecommend, doLog } = useFeedProtocol();

    return (
        <Feed
            content={content}
            onProfile={doProfile}
            onLog={doLog}
            onRecommend={doRecommend}
        />
    );
}

export function Component() {
    const { code } = useParams();
    const config = useRecoilValue<SMConfig>(appConfiguration);
    const [content, setContent] = useState<(string | ArrayBuffer)[]>();
    const [username, setUsername] = useRecoilState<string | undefined>(currentUserName);
    const showFeedActions = useRecoilValue(menuShowFeedActions);
    const MYCODE = useRandom(10);

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
                    {config && !username && <EnterUsername onUsername={setUsername} />}
                    {config && username && (
                        <>
                            <FeedWrapper content={content} />
                            {showFeedActions && !config.hideActionsButton && (
                                <nav className={style.speedContainer}>
                                    <SpeedMenu />
                                </nav>
                            )}
                        </>
                    )}
                    <SharePage code={MYCODE} />
                    <DataPage />
                    <ProfilePage />
                    <RecommendationPage />
                    <BlockDialog />
                </main>
            </FeedProtocol>
            <ErrorDialog />
            <TabBlocker />
        </>
    );
}
