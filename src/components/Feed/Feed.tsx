import { useState, useCallback, useEffect, useRef } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { useRecoilValue } from 'recoil';
import { configuration } from '@genaism/state/settingsState';
import ContentLoader from '../ContentLoader/ContentLoader';
import { LogEntry, ScoredRecommendation, UserNodeData, UserNodeId } from '@knicos/genai-recom';
import { useActionLogService, useProfilerService } from '@genaism/hooks/services';
import { useRecommendations } from '@genaism/hooks/recommender';

interface Props {
    id?: UserNodeId;
    content?: (string | ArrayBuffer)[];
    onProfile?: (profile: UserNodeData) => void;
    onRecommend?: (recommendations: ScoredRecommendation[]) => void;
    onLog?: () => void;
    noLog?: boolean;
    noActions?: boolean;
}

export default function Feed({ content, onProfile, onLog, onRecommend, id, noLog, noActions }: Props) {
    const [feedList, setFeedList] = useState<ScoredRecommendation[]>([]);
    const moreState = useRef(true);
    const profiler = useProfilerService();
    const aid = id || profiler.getCurrentUser();
    const appConfig = useRecoilValue(configuration(aid));
    const { recommendations, more } = useRecommendations(5, aid, appConfig?.recommendations);
    const actionLog = useActionLogService();

    useEffect(() => {
        if (moreState.current && recommendations.length > 0) {
            setFeedList((old) => [...old, ...recommendations]);
            moreState.current = false;
            if (onRecommend) onRecommend(recommendations);
            if (onProfile) onProfile(profiler.getUserProfile(aid));
        }
    }, [recommendations, onProfile, onRecommend, profiler, aid]);

    const doLog = useCallback(
        (data: LogEntry) => {
            if (!noLog) {
                actionLog.addLogEntry(data, aid);
                if (onLog) onLog();
            }
        },
        [onLog, noLog, actionLog, aid]
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
