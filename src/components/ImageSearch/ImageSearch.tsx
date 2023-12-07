import { useState, useCallback, KeyboardEvent } from 'react';
import style from './style.module.css';
import TextField from '@mui/material/TextField';
import useImageSearch, { ImageResult } from '@genaism/services/imageSearch/hook';
import ImageItem from './ImageItem';
import { useTranslation } from 'react-i18next';
import { InputAdornment, Pagination } from '@mui/material';
import SearchIcon from '@mui/icons-material/Search';
import { canvasFromURL } from '@genaism/util/canvas';

interface Props {
    onAdd: (url: string, meta: ImageResult) => void;
    columns?: number;
}

export default function ImageSearch({ onAdd, columns }: Props) {
    const { t } = useTranslation();
    const [page, setPage] = useState(1);
    const [query, setQuery] = useState('');
    const images = useImageSearch(query, { page });
    const [selected, setSelected] = useState(new Set<string>());

    const doChange = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            setQuery((e.target as HTMLInputElement).value);
            setPage(1);
            console.log(e);
        }
    }, []);

    const doAdd = useCallback(
        (data: ImageResult) => {
            setSelected((old) => {
                const newSet = new Set(old);
                newSet.add(data.id);
                return newSet;
            });
            canvasFromURL(data.url, 500).then((canvas) => {
                onAdd(canvas.toDataURL(), data);
            });
        },
        [onAdd]
    );

    // Generate the column buckets
    const COLS = columns || 4;
    const columnBuckets: JSX.Element[][] = Array.from({ length: COLS }, () => []);
    images.results.forEach((r, ix) => {
        const c = ix % COLS;
        columnBuckets[c].push(
            <ImageItem
                key={ix}
                data={r}
                onClick={doAdd}
                disabled={selected.has(r.id)}
            />
        );
    });

    return (
        <div className={style.container}>
            <div className={style.controls}>
                <TextField
                    label={t('creator.labels.search')}
                    type="search"
                    variant="outlined"
                    onKeyDown={doChange}
                    fullWidth
                    InputProps={{
                        startAdornment: (
                            <InputAdornment position="start">
                                <SearchIcon />
                            </InputAdornment>
                        ),
                    }}
                />
            </div>
            <Pagination
                count={images.pages}
                page={page}
                onChange={(_, p) => setPage(p)}
            />
            <div className={style.grid}>
                {columnBuckets.map((c, ix) => (
                    <div
                        key={ix}
                        className={style.column}
                    >
                        {c}
                    </div>
                ))}
            </div>
        </div>
    );
}
