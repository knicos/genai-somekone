import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { useEffect, useState } from 'react';
import ContentError from './ContentError';
import ContentProgress from './ContentProgress';

type LoadingStatus = 'waiting' | 'downloading' | 'loading' | 'failed-download' | 'failed-load' | 'done';

interface Props {
    content?: (ArrayBuffer | string)[];
    onLoaded?: () => void;
}

export default function ContentLoader({ content, onLoaded }: Props) {
    const [status, setStatus] = useState<LoadingStatus>('waiting');
    const [progress, setProgress] = useState<number | undefined>();

    useEffect(() => {
        if (content && content.length > 0) {
            setStatus('downloading');
            content.forEach((c) => {
                getZipBlob(c, setProgress)
                    .then(async (blob) => {
                        setStatus('loading');

                        try {
                            await loadFile(blob);
                            setStatus('done');
                            if (onLoaded) onLoaded();
                        } catch (e) {
                            console.error(e);
                            setStatus('failed-load');
                        }
                    })
                    .catch((e) => {
                        console.error(e);
                        setStatus('failed-download');
                    });
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
