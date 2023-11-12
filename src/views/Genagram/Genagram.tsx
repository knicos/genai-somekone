import React, { useRef, useState, useCallback, useEffect } from 'react';
import style from './style.module.css';
import ImageFeed from '../../components/ImageFeed/ImageFeed';
import { loadFile } from '../../services/loader/fileLoader';
import { generateFeed } from '../../services/recommender/recommender';
import { LogEntry } from '../../services/profiler/profilerTypes';
import { addLogEntry, getTasteProfile, getTopContent } from '../../services/profiler/profiler';
import { useSearchParams } from 'react-router-dom';

export function Component() {
    const [params] = useSearchParams();
    const [feedList, setFeedList] = useState<string[]>([]);

    const doMore = useCallback(() => {
        const f = generateFeed(10);
        setFeedList((old) => [...old, ...f]);
    }, [setFeedList]);

    const doLog = useCallback((data: LogEntry) => {
        addLogEntry(data);
    }, []);

    const doLoad = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.currentTarget.files) {
            loadFile(e.currentTarget.files[0]).then(() => {
                const f = generateFeed(10);
                setFeedList((old) => [...old, ...f]);
            });
        }
    }, []);

    useEffect(() => {
        const url = params.get('content') || 'https://tmstore.blob.core.windows.net/projects/smTestContent1.zip';
        fetch(url).then(async (result) => {
            if (result.status !== 200) {
                console.error(result);
                return;
            }
            await loadFile(await result.blob());
            const f = generateFeed(5);
            setFeedList((old) => [...old, ...f]);
        });
    }, [params]);

    return (
        <>
            <div className={style.page}>
                <input
                    type="file"
                    id="openfile"
                    onChange={doLoad}
                    hidden={true}
                    accept=".zip,application/zip"
                />
                <section className={style.feedView}>
                    <div className={style.titleOuter}>
                        <div className={style.title}>
                            <img
                                src="/logo48_bw.png"
                                alt="GenAIMedia Logo"
                                width={48}
                                height={48}
                            />
                            <h1>Genagram</h1>
                        </div>
                    </div>

                    <ImageFeed
                        images={feedList}
                        onMore={doMore}
                        onLog={doLog}
                    />

                    <div className={style.footerOuter}></div>
                </section>
            </div>
        </>
    );
}
