import { useState, useCallback, useEffect } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { addLogEntry, getCurrentUser, getUserProfile } from '@genaism/services/profiler/profiler';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';
import { useRecoilValue } from 'recoil';
import { appConfiguration } from '@genaism/state/settingsState';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    id?: UserNodeId;
    content?: (string | ArrayBuffer)[];
    onProfile?: (profile: ProfileSummary) => void;
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
    const { recommendations, more } = useRecommendations(5, id, appConfig?.recommendations);

    useEffect(() => {
        setFeedList((old) => [...old, ...recommendations]);
        if (onRecommend) onRecommend(recommendations);
        if (onProfile) onProfile(getUserProfile());
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

    useEffect(() => {
        if (content) {
            content.forEach((c) => {
                getZipBlob(c).then(async (blob) => {
                    await loadFile(blob);
                    more();
                });
            });
        } else {
            more();
        }
    }, [content, more]);

    return (
        <section className={style.feedView}>
            <ImageFeed
                images={feedList}
                onMore={more}
                onLog={doLog}
                noActions={noActions}
            />

            <div className={style.footerOuter}></div>
        </section>
    );
}
