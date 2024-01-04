import { getContentData, getContentMetadata } from '@genaism/services/content/content';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import Stepper from './Stepper';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import extraTags from './extraTags.json';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { addEdge } from '@genaism/services/graph/edges';
import { getTopicId } from '@genaism/services/concept/concept';
import AlertPara from '@genaism/components/AlertPara/AlertPara';

interface TagProps {
    tag: string;
    checked?: boolean;
    onChange: (tag: string, check: boolean) => void;
}

function TagCheck({ tag, checked, onChange }: TagProps) {
    return (
        <FormControlLabel
            control={
                <Checkbox
                    checked={checked || false}
                    onChange={(_, checked) => onChange(tag, checked)}
                />
            }
            label={tag}
        />
    );
}

interface Props {
    content: ContentNodeId;
    onNext: () => void;
}

const MAX_TAGS = 5;

export default function ImageDescribe({ content, onNext }: Props) {
    const [selected, setSelected] = useState<Set<string>>();
    const { t } = useTranslation('creator');

    useEffect(() => {
        setSelected(undefined);
    }, [content]);

    const doChange = useCallback((tag: string, checked: boolean) => {
        setSelected((old) => {
            if (checked && old && old.size >= MAX_TAGS) return old;
            const newSet = new Set<string>(old);
            if (checked) newSet.add(tag);
            else newSet.delete(tag);
            return newSet;
        });
    }, []);

    return (
        <>
            <main className={style.contentSection}>
                <header>
                    <h1>{t('extraTagsTitle')}</h1>
                </header>
                <AlertPara severity="info">{t('hints.describeImages', { max: MAX_TAGS })}</AlertPara>
                <div className={style.tagContainer}>
                    <img
                        src={getContentData(content)}
                        width={400}
                    />
                    <div className={style.tagList}>
                        {extraTags.map((tag) => (
                            <TagCheck
                                key={tag}
                                tag={tag}
                                checked={selected?.has(tag)}
                                onChange={doChange}
                            />
                        ))}
                    </div>
                </div>
            </main>
            <Stepper
                onNext={() => {
                    const meta = getContentMetadata(content);
                    if (meta && selected) {
                        const tagArray = Array.from(selected);
                        tagArray.forEach((tag) => {
                            meta.labels.push({ label: tag, weight: 1 });
                            addEdge('topic', content, getTopicId(tag));
                        });
                    }
                    onNext();
                }}
            />
        </>
    );
}
