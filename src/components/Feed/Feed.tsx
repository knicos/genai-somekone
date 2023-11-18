import { useState, useCallback, useEffect } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { generateFeed } from '@genaism/services/recommender/recommender';
import { LogEntry, ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { addLogEntry } from '@genaism/services/profiler/profiler';
import { useTranslation } from 'react-i18next';

interface Props {
    content?: string | ArrayBuffer;
    onProfile?: (profile: ProfileSummary) => void;
}

export default function Feed({ content, onProfile }: Props) {
    const { t } = useTranslation();
    const [feedList, setFeedList] = useState<string[]>([]);

    const doMore = useCallback(() => {
        const [f, profile] = generateFeed(5);
        setFeedList((old) => [...old, ...f]);
        if (onProfile) onProfile(profile);
    }, [setFeedList, onProfile]);

    const doLog = useCallback((data: LogEntry) => {
        addLogEntry(data);
    }, []);

    useEffect(() => {
        if (content) {
            getZipBlob(content).then(async (blob) => {
                await loadFile(blob);
                const [f, profile] = generateFeed(5);
                setFeedList((old) => [...old, ...f]);
                if (onProfile) onProfile(profile);
            });
        }
    }, [content]);

    return (
        <section className={style.feedView}>
            <div className={style.titleOuter}>
                <div className={style.title}>
                    <img
                        src="/logo48_bw.png"
                        alt="GenAIMedia Logo"
                        width={48}
                        height={48}
                    />
                    <h1>{t('feed.titles.main')}</h1>
                </div>
            </div>

            <ImageFeed
                images={feedList}
                onMore={doMore}
                onLog={doLog}
            />

            <div className={style.footerOuter}></div>
        </section>
    );
}
