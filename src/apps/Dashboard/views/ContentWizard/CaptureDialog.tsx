import { Options } from '@genaism/services/imageSearch/hook';
import style from './style.module.css';
import { Dialog, DialogActions, DialogContent, DialogTitle, LinearProgress, Slider } from '@mui/material';
import { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useContentService } from '@genaism/hooks/services';
import { Button, Spinner } from '@genai-fi/base';
import captureImages from './capture';
import { ContentMetadata, ContentNodeId } from '@genai-fi/recom';

interface Props {
    open: boolean;
    onClose: () => void;
    query: string;
    options: Options;
    onComplete: () => void;
    tags?: string[];
    lookalike?: ContentNodeId;
    lookalikeDistance?: number;
}

function tagsCheck(meta: ContentMetadata, tags: Set<string>) {
    return meta.labels.findIndex((v) => tags.has(v.label)) >= 0;
}

const MAX_PAGES = 100;

export default function CaptureDialog({ tags, onClose, open, query, options }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(50);
    const [collect, setCollect] = useState(false);
    const [page, setPage] = useState(0);
    const contentSvc = useContentService();
    const [count, setCount] = useState(0);
    const captureState = useRef(new Set<ContentNodeId>());

    useEffect(() => {
        if (open) {
            setSize(50);
            setCount(0);
        }
    }, [open]);

    const done = page === 0 && count >= size;

    useEffect(() => {
        if (page > 0 && count < size) {
            const tagSet = new Set(tags);
            captureImages(
                contentSvc,
                captureState.current,
                query,
                page,
                options?.source || 'pixabay',
                options?.order || 'latest',
                count,
                size,
                (meta: ContentMetadata) => (tags ? tagsCheck(meta, tagSet) : true)
            ).then((tally) => {
                setTimeout(() => {
                    setCount(tally);
                    if (tally < size && page < MAX_PAGES) {
                        setPage((p) => p + 1);
                    } else {
                        setPage(0);
                        setCollect(false);
                    }
                }, 500);
            });
        }
    }, [page, query, options, count, contentSvc, size, tags]);

    useEffect(() => {
        if (collect) {
            setCount(0);
            setPage(1);
        }
    }, [collect]);

    const progress = count / size;

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="xs"
        >
            <DialogTitle>{t('creator.titles.captureImages')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '1rem' }}>
                {(page > 0 || done) && (
                    <>
                        {!done && <Spinner />}
                        {progress !== undefined && (
                            <LinearProgress
                                sx={{ width: '100%' }}
                                variant="determinate"
                                value={Math.round(progress * 100)}
                            />
                        )}
                    </>
                )}
                {page === 0 && !done && (
                    <>
                        <div
                            id="number-of-images-label"
                            className={style.label}
                        >
                            {t('creator.labels.numberOfImages')}
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
                    </>
                )}
            </DialogContent>
            <DialogActions>
                <Button
                    disabled={page > 0 || done}
                    variant="contained"
                    onClick={() => setCollect(true)}
                >
                    {t('creator.actions.add')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    {t('creator.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
