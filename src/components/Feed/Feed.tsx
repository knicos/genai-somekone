import { useState, useCallback, useEffect, useRef } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { LogEntry, UserNodeData } from '@genaism/services/users/userTypes';
import { addLogEntry, getCurrentUser, getUserProfile } from '@genaism/services/profiler/profiler';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';
import { useRecoilValue } from 'recoil';
import { appConfiguration } from '@genaism/state/settingsState';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import ContentLoader from '../ContentLoader/ContentLoader';

interface Props {
    id?: UserNodeId;
    content?: (string | ArrayBuffer)[];
    onProfile?: (profile: UserNodeData) => void;
    onRecommend?: (recommendations: ScoredRecommendation[]) => void;
    onLog?: () => void;
    noLog?: boolean;
    noActions?: boolean;
}

export default function Feed({
    content,
    onProfile,
    onLog,
    onRecommend,
    id = getCurrentUser(),
    noLog,
    noActions,
}: Props) {
    const [feedList, setFeedList] = useState<ScoredRecommendation[]>([]);
    const appConfig = useRecoilValue(appConfiguration);
    const moreState = useRef(true);
    const { recommendations, more } = useRecommendations(5, id, appConfig?.recommendations);

    useEffect(() => {
        if (moreState.current && recommendations.length > 0) {
            setFeedList((old) => [...old, ...recommendations]);
            moreState.current = false;
            if (onRecommend) onRecommend(recommendations);
            if (onProfile) onProfile(getUserProfile());
        }
    }, [recommendations, onProfile, onRecommend]);

    const doLog = useCallback(
        (data: LogEntry) => {
            if (!noLog) {
                addLogEntry(data);
                if (onLog) onLog();
            }
        },
        [onLog, noLog]
    );

    const doLoaded = useCallback(() => {
        more();
    }, [more]);

    useEffect(() => {
        if (!content) more();
    }, [more, content]);

    return (
        <section className={style.feedView}>
            <ImageFeed
                images={feedList}
                onMore={() => {
                    moreState.current = true;
                    more();
                }}
                onLog={doLog}
                noActions={noActions}
                showLabels={appConfig?.showTopicLabels}
                alwaysActive={appConfig?.alwaysActive}
            />

            <div className={style.footerOuter}></div>
            <ContentLoader
                content={content}
                onLoaded={doLoaded}
            />
        </section>
    );
}
