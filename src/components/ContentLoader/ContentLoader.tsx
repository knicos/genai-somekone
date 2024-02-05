import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { useEffect, useRef, useState } from 'react';
import ContentError from './ContentError';
import ContentProgress from './ContentProgress';

type LoadingStatus = 'waiting' | 'downloading' | 'loading' | 'failed-download' | 'failed-load' | 'done';

interface Props {
    content?: (ArrayBuffer | string)[];
    onLoaded?: () => void;
}

export default function ContentLoader({ content, onLoaded }: Props) {
    const contentRef = useRef(new Set<string>());
    const [status, setStatus] = useState<LoadingStatus>('waiting');
    const [progress, setProgress] = useState<number | undefined>();

    useEffect(() => {
        if (content && content.length > 0) {
            // Only load each once
            const contentf = content.filter((c) => (typeof c === 'string' ? !contentRef.current.has(c) : true));
            if (contentf.length === 0) return;

            setStatus('downloading');

            const promises: Promise<Blob>[] = [];
            const downloadState = new Array(contentf.length).fill(0);

            contentf.forEach((c, ix) => {
                if (typeof c === 'string') {
                    contentRef.current.add(c);
                }
                promises.push(
                    getZipBlob(c, (percent: number) => {
                        downloadState[ix] = percent;
                        setProgress(downloadState.reduce((s, v) => s + v, 0) / contentf.length);
                    })
                );
            });

            Promise.all(promises)
                .then((blobs) => {
                    setStatus('loading');
                    setProgress(undefined);

                    const loadPromises = blobs.map((blob) => loadFile(blob));
                    Promise.all(loadPromises)
                        .then(() => {
                            setStatus('done');
                            if (onLoaded) onLoaded();
                        })
                        .catch((e) => {
                            console.error(e);
                            setStatus('failed-load');
                        });
                })
                .catch((e) => {
                    console.error(e);
                    setStatus('failed-download');
                });
        } else {
            setStatus('waiting');
        }
    }, [content, onLoaded]);

    return (
        <>
            <ContentProgress
                status={status === 'downloading' ? 'download' : status === 'loading' ? 'load' : 'none'}
                progress={progress}
            />
            <ContentError
                error={status === 'failed-download' ? 'download' : status === 'failed-load' ? 'load' : 'none'}
            />
        </>
    );
}
