import { ChangeEvent, useEffect, useState } from 'react';
import { Autocomplete, InputAdornment, TextField } from '@mui/material';
import style from './style.module.css';
import { StageState } from './types';
import { getTopicId } from '@genaism/services/concept/concept';
import TagIcon from '@mui/icons-material/Tag';
import Stepper from './Stepper';
import { useTranslation } from 'react-i18next';
import AlertPara from '@genaism/components/AlertPara/AlertPara';

interface Props {
    onAddNext: (stage: StageState[]) => void;
    onNext: () => void;
}

type TagError = 'none' | 'short' | 'long' | 'hash' | 'whitespace';

function validate(value: string): TagError {
    // if (value.length === 0) return 'none';
    if (value.length < 3) return 'short';
    if (value.charAt(0) === '#') return 'hash';
    if (value.length > 20) return 'long';
    if (/\s/.test(value)) return 'whitespace';
    return 'none';
}

export default function CategorySelect({ onAddNext, onNext }: Props) {
    const { t } = useTranslation('creator');
    const [selected, setSelected] = useState<string>('');
    const [isdone, setDone] = useState(false);
    const [error, setError] = useState<TagError>('none');

    useEffect(() => {
        if (selected.length > 0) {
            onAddNext([{ view: 'images', topicId: getTopicId(selected) }]);
            setDone(true);
        }
    }, [selected, onAddNext]);

    const suggestions = t('allowedTopics', { returnObjects: true }) as string[];

    return (
        <>
            <main className={style.contentSection}>
                <header>
                    <h1>{t('categorySelectTitle')}</h1>
                </header>
                <AlertPara severity="info">{t('hints.categorySelect')}</AlertPara>
                <div className={style.categories}>
                    <Autocomplete
                        options={suggestions}
                        freeSolo
                        fullWidth
                        onChange={(_, value) => {
                            if (value) {
                                const err = validate(value);
                                setError(err);
                                if (err === 'none') {
                                    setSelected(value);
                                } else {
                                    setDone(false);
                                }
                            }
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                error={error !== 'none'}
                                helperText={error !== 'none' ? t(`errors.${error}`) : undefined}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TagIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={selected}
                                onChange={(event: ChangeEvent<HTMLInputElement>) => {
                                    const err = validate(event.currentTarget.value);
                                    setError(err);
                                    if (err === 'none') {
                                        setSelected(event.currentTarget.value);
                                    } else {
                                        setDone(false);
                                    }
                                }}
                            />
                        )}
                    />
                </div>
            </main>
            <Stepper onNext={isdone ? onNext : undefined} />
        </>
    );
}
