import { FormControlLabel, InputAdornment, Radio, RadioGroup, TextField } from '@mui/material';
import style from '../style.module.css';
import { useTranslation } from 'react-i18next';
import SearchIcon from '@mui/icons-material/Search';
import { KeyboardEvent, useCallback, useEffect, useRef, useState } from 'react';
import { Button, canvasFromURL, LargeButton } from '@genai-fi/base';
import useImageSearch from '@genaism/services/imageSearch/hook';
import { useContentService } from '@genaism/hooks/services';
import CaptureDialog from '../CaptureDialog';

interface Props {
    disabled?: boolean;
}

export default function QuerySource({ disabled }: Props) {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const [query, setQuery] = useState<string | undefined>();
    const [order, setOrder] = useState<'latest' | 'popular'>('latest');
    const [content, setContent] = useState<string[]>([]);
    const newimages = useImageSearch(query, { page: 1, source: 'pixabay', order });
    const contentSvc = useContentService();
    const [captureOpen, setCaptureOpen] = useState(false);

    const doChange = useCallback((e: KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            const value = (e.target as HTMLInputElement).value;
            if (value.length >= 2) {
                //setImages([]);
                setQuery(value);
            }
        }
    }, []);

    const doSearch = useCallback(() => {
        const value = inputRef.current?.value;
        if (value && value.length >= 2) {
            //setImages([]);
            setQuery(value);
        }
    }, []);

    useEffect(() => {
        setContent([]);
        newimages.results.forEach((image) => {
            if (contentSvc.hasContent(`content:${image.id}`)) return;
            canvasFromURL(image.url, 500).then((canvas) => {
                const imageData = canvas.toDataURL('image/jpeg', 0.95);
                setContent((old) => [...old, imageData]);
            });
        });
    }, [newimages, contentSvc]);

    return (
        <div style={{ padding: '1rem' }}>
            <div className={style.controlsContainer}>
                <div className={style.controls}>
                    <TextField
                        disabled={disabled}
                        label={t('creator.labels.search')}
                        type="search"
                        variant="outlined"
                        onKeyDown={doChange}
                        inputRef={inputRef}
                        InputProps={{
                            startAdornment: (
                                <InputAdornment position="start">
                                    <SearchIcon />
                                </InputAdornment>
                            ),
                        }}
                    />
                    <Button
                        variant="contained"
                        onClick={doSearch}
                        disabled={disabled}
                    >
                        {t('creator.actions.go')}
                    </Button>
                </div>
            </div>
            <div className={style.controlsContainer}>
                <div className={style.controls}>
                    <RadioGroup
                        sx={{ flexDirection: 'row', gap: '1rem' }}
                        defaultValue="latest"
                        name="radio-buttons-group"
                        value={order}
                        onChange={(_, value) => {
                            setOrder(value as 'latest' | 'popular');
                        }}
                    >
                        <FormControlLabel
                            value="latest"
                            control={<Radio />}
                            label={t('creator.labels.latest')}
                            disabled={disabled}
                        />
                        <FormControlLabel
                            value="popular"
                            control={<Radio />}
                            label={t('creator.labels.popular')}
                            disabled={disabled}
                        />
                    </RadioGroup>
                </div>
            </div>
            <div className={style.imageGrid}>
                {content.map((c, ix) => {
                    return (
                        <img
                            key={ix}
                            src={c}
                            alt=""
                            width={80}
                            height={80}
                        />
                    );
                })}
            </div>
            <LargeButton
                variant="contained"
                disabled={disabled || !query}
                onClick={() => setCaptureOpen(true)}
                color="secondary"
            >
                {t('creator.actions.addImages')}
            </LargeButton>
            <CaptureDialog
                open={captureOpen}
                onClose={() => setCaptureOpen(false)}
                query={query || ''}
                options={{ order, source: 'pixabay' }}
                onComplete={() => {}}
            />
        </div>
    );
}
