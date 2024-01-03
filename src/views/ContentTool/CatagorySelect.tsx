import { ChangeEvent, useEffect, useState } from 'react';
import { Autocomplete, InputAdornment, TextField } from '@mui/material';
import style from './style.module.css';
import { StageState } from './types';
import { getTopicId } from '@genaism/services/concept/concept';
import TagIcon from '@mui/icons-material/Tag';
import Stepper from './Stepper';
import suggestions from './allowedTopics.json';
import { useTranslation } from 'react-i18next';

interface Props {
    onAddNext: (stage: StageState[]) => void;
    onNext: () => void;
}

export default function CategorySelect({ onAddNext, onNext }: Props) {
    const { t } = useTranslation('creator');
    const [selected, setSelected] = useState<string>('');
    const [isdone, setDone] = useState(false);

    useEffect(() => {
        if (selected.length >= 3) {
            onAddNext([{ view: 'images', topicId: getTopicId(selected) }]);
            setDone(true);
        } else {
            setDone(false);
        }
    }, [selected, onAddNext]);

    return (
        <>
            <main className={style.contentSection}>
                <header>
                    <h1>{t('categorySelectTitle')}</h1>
                </header>
                <div className={style.categories}>
                    <Autocomplete
                        options={suggestions}
                        freeSolo
                        fullWidth
                        onChange={(_, value) => {
                            if (value) setSelected(value);
                        }}
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                InputProps={{
                                    ...params.InputProps,
                                    startAdornment: (
                                        <InputAdornment position="start">
                                            <TagIcon />
                                        </InputAdornment>
                                    ),
                                }}
                                value={selected}
                                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                                    setSelected(event.currentTarget.value)
                                }
                            />
                        )}
                    />
                </div>
            </main>
            <Stepper onNext={isdone ? onNext : undefined} />
        </>
    );
}
