import { useState, useCallback, useEffect } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { addLogEntry, getUserProfile } from '@genaism/services/profiler/profiler';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { useRecommendations } from '@genaism/services/recommender/hooks';

interface Props {
    content?: (string | ArrayBuffer)[];
    onProfile?: (profile: ProfileSummary) => void;
    onRecommend?: (recommendations: ScoredRecommendation[]) => void;
    onLog?: () => void;
}

export default function Feed({ content, onProfile, onLog, onRecommend }: Props) {
    const [feedList, setFeedList] = useState<ScoredRecommendation[]>([]);
    const { recommendations, more } = useRecommendations(5);

    useEffect(() => {
        setFeedList((old) => [...old, ...recommendations]);
        if (onRecommend) onRecommend(recommendations);
        if (onProfile) onProfile(getUserProfile());
    }, [recommendations, onProfile, onRecommend]);

    const doLog = useCallback(
        (data: LogEntry) => {
            addLogEntry(data);
            if (onLog) onLog();
        },
        [onLog]
    );

    useEffect(() => {
        if (content) {
            content.forEach((c) => {
                getZipBlob(c).then(async (blob) => {
                    await loadFile(blob);
                    more();
                });
            });
        }
    }, [content, more]);

    return (
        <section className={style.feedView}>
            <ImageFeed
                images={feedList}
                onMore={more}
                onLog={doLog}
            />

            <div className={style.footerOuter}></div>
        </section>
    );
}
