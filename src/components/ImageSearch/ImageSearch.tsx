import { useState, useCallback, KeyboardEvent, useMemo, useEffect, useRef } from 'react';
import style from './style.module.css';
import TextField from '@mui/material/TextField';
import useImageSearch, { ImageResult, SearchSource } from '@genaism/services/imageSearch/hook';
import ImageItem from './ImageItem';
import { useTranslation } from 'react-i18next';
import { InputAdornment } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { canvasFromURL } from '@genaism/util/canvas';
import { LargeButton } from '@knicos/genai-base';
import { AlertPara } from '@knicos/genai-base';

interface Props {
    onAdd: (url: string, meta: ImageResult) => void;
    columns?: number;
    selected?: Set<string>;
    onSelect?: (id: string) => void;
    disabled?: boolean;
    source?: SearchSource;
}

export default function ImageSearch({ onAdd, columns, selected, onSelect, disabled, source }: Props) {
    const { t } = useTranslation('creator');
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const [images, setImages] = useState<ImageResult[]>([]);
    const newimages = useImageSearch(query, { page, source });
    const [more, setMore] = useState(false);
    const inputRef = useRef<HTMLInputElement>();

    useEffect(() => {
        setImages((old) => [...old, ...newimages.results]);
        setMore(false);
    }, [newimages]);

    useEffect(() => {
        if (more) {
            setPage((p) => ++p);
        }
    }, [more]);

    const doChange = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value;
            if (value.length >= 2) {
                setImages([]);
                setQuery(value);
                setPage(1);
            }
        }
    }, []);

    const doSearch = useCallback(() => {
        const value = inputRef.current?.value;
        if (value && value.length >= 2) {
            setImages([]);
            setQuery(value);
            setPage(1);
        }
    }, []);

    const doAdd = useCallback(
        (data: ImageResult) => {
            if (onSelect) onSelect(data.id);
            canvasFromURL(data.url, 500).then((canvas) => {
                onAdd(canvas.toDataURL(), data);
            });
        },
        [onAdd, onSelect]
    );

    const doScroll = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
        const scrollHeight = e.currentTarget.scrollHeight;
        const clientHeight = e.currentTarget.clientHeight;
        const scrollPos = e.currentTarget.scrollTop;

        if (scrollPos + clientHeight * 2 > scrollHeight) {
            setMore(true);
        }
    }, []);

    // Generate the column buckets

    const columnBuckets = useMemo(() => {
        const COLS = columns || 4;
        const columnBuckets: ImageResult[][] = Array.from({ length: COLS }, () => []);
        const columnHeights: number[] = new Array(COLS);
        columnHeights.fill(0);

        images.forEach((r) => {
            const max = Math.min(...columnHeights);
            const c = columnHeights.indexOf(max);
            columnHeights[c] += r.height;
            columnBuckets[c].push(r);
        });

        return columnBuckets;
    }, [images, columns]);

    return (
        <div
            className={style.scroller}
            onScroll={doScroll}
            style={{ pointerEvents: disabled ? 'none' : 'unset' }}
        >
            <div className={style.container}>
                <div className={style.controlsContainer}>
                    <div className={style.controls}>
                        <TextField
                            label={t('search')}
                            type="search"
                            variant="outlined"
                            onKeyDown={doChange}
                            disabled={disabled}
                            inputRef={inputRef}
                            InputProps={{
                                startAdornment: (
                                    <InputAdornment position="start">
                                        <SearchIcon />
                                    </InputAdornment>
                                ),
                            }}
                        />
                        <LargeButton
                            variant="contained"
                            onClick={doSearch}
                        >
                            {t('actions.go')}
                        </LargeButton>
                    </div>
                    <AlertPara severity="info">{t('hints.imageSearch')}</AlertPara>
                </div>
                <div className={style.grid}>
                    {columnBuckets.map((c, ix) => (
                        <div
                            key={ix}
                            className={style.column}
                        >
                            {c.map((r, ix2) => (
                                <ImageItem
                                    key={ix2}
                                    data={r}
                                    onClick={doAdd}
                                    disabled={disabled || selected?.has(r.id)}
                                />
                            ))}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}
