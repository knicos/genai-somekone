import { Options } from '@genaism/services/imageSearch/hook';
import style from './style.module.css';
import { Slider } from '@mui/material';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { pixabaySearch } from '@genaism/services/imageSearch/pixabay';
import { useContentService } from '@genaism/hooks/services';
import { canvasFromURL, LargeButton } from '@knicos/genai-base';
import ProgressDialog from '../ProgressDialog/ProgressDialog';

interface Props {
    query: string;
    options: Options;
    onComplete: () => void;
}

export default function CaptureProcess({ query, options }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(50);
    const [collect, setCollect] = useState(false);
    const [page, setPage] = useState(0);
    const contentSvc = useContentService();
    const [count, setCount] = useState(0);

    useEffect(() => {
        if (page > 0 && count < size) {
            if (options.source === 'pixabay') {
                pixabaySearch(query, { page, perPage: 20, order: options?.order }).then((r) => {
                    const results = {
                        total: r.totalHits,
                        pages: Math.ceil(r.totalHits / 20),
                        results: r.hits.map((h) => ({
                            url: h.webformatURL,
                            author: h.user,
                            tags: h.tags.split(',').map((t) => t.trim()),
                            id: `pixabay-${h.id}`,
                            width: h.webformatWidth,
                            height: h.webformatHeight,
                        })),
                    };

                    let tally = count;

                    const promises = results.results.map((image) => {
                        if (contentSvc.hasContent(`content:${image.id}`))
                            return new Promise<void>((resolve) => resolve());
                        if (tally >= size) return;

                        tally += 1;
                        return canvasFromURL(image.url, 500).then((canvas) => {
                            const imageData = canvas.toDataURL('image/jpeg', 0.95);
                            console.log('Adding', image.id);
                            contentSvc.addContent(imageData, {
                                id: image.id,
                                labels: image.tags.map((t) => ({ label: t, weight: 1 })),
                                author: image.author,
                            });
                        });
                    });

                    Promise.all(promises).then(() => {
                        console.log('Done', tally);
                        setTimeout(() => {
                            setCount(tally);
                            if (tally < size) {
                                setPage((p) => p + 1);
                            } else {
                                setPage(0);
                                setCollect(false);
                            }
                        }, 500);
                    });
                });
            }
        }
    }, [page, query, options, count, contentSvc, size]);

    useEffect(() => {
        if (collect) {
            setCount(0);
            setPage(1);
        }
    }, [collect]);

    return (
        <section className={style.wizard}>
            <div
                id="number-of-images-label"
                className={style.label}
            >
                {t('dashboard.labels.numberOfImages')}
            </div>
            <Slider
                aria-labelledby="number-of-images-label"
                value={size}
                onChange={(_, value) => setSize(value as number)}
                min={10}
                max={1000}
                step={10}
                valueLabelDisplay="auto"
            />
            <LargeButton
                variant="contained"
                onClick={() => setCollect(true)}
            >
                {t('actions.go')}
            </LargeButton>
            <ProgressDialog
                open={page > 0}
                title="Getting Images"
                progress={count / size}
            />
        </section>
    );
}
