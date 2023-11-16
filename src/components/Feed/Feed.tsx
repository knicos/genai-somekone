import { useState, useCallback, useEffect } from 'react';
import style from './style.module.css';
import ImageFeed from '@genaism/components/ImageFeed/ImageFeed';
import { loadFile } from '@genaism/services/loader/fileLoader';
import { generateFeed } from '@genaism/services/recommender/recommender';
import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { addLogEntry } from '@genaism/services/profiler/profiler';
import { useTranslation } from 'react-i18next';

interface Props {
    content?: string;
}

export default function Feed({ content }: Props) {
    const { t } = useTranslation();
    const [feedList, setFeedList] = useState<string[]>([]);

    const doMore = useCallback(() => {
        const f = generateFeed(5);
        setFeedList((old) => [...old, ...f]);
    }, [setFeedList]);

    const doLog = useCallback((data: LogEntry) => {
        addLogEntry(data);
    }, []);

    useEffect(() => {
        const url = content || 'https://tmstore.blob.core.windows.net/projects/smTestContent1.zip';
        fetch(url).then(async (result) => {
            if (result.status !== 200) {
                console.error(result);
                return;
            }
            await loadFile(await result.blob());
            const f = generateFeed(5);
            setFeedList((old) => [...old, ...f]);
        });
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
