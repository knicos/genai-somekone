import { useEffect, useState } from 'react';
import allowedTopics from './allowedTopics.json';
import { uniformUniqueSubset } from '@genaism/util/subsets';
import { Chip } from '@mui/material';
import style from './style.module.css';
import { StageState } from './types';
import { getTopicId } from '@genaism/services/concept/concept';

interface Props {
    onAddNext: (stage: StageState[]) => void;
}

export default function CategorySelect({ onAddNext }: Props) {
    const [available, setAvailable] = useState<string[]>([]);
    const [selected, setSelected] = useState<string>();

    useEffect(() => {
        setAvailable(uniformUniqueSubset(allowedTopics, 5, (v) => v));
    }, []);

    useEffect(() => {
        if (selected) {
            onAddNext([{ view: 'images', topicId: getTopicId(selected) }]);
        }
    }, [selected]);

    return (
        <>
            <header>
                <h1>Choose a Category</h1>
            </header>
            <div className={style.categories}>
                {available.map((a) => (
                    <Chip
                        label={a}
                        onClick={() => setSelected(a)}
                    />
                ))}
            </div>
        </>
    );
}
