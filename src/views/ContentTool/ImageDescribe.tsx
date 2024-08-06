import Stepper from './Stepper';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { Checkbox, FormControlLabel } from '@mui/material';
import { useCallback, useEffect, useState } from 'react';
import { AlertPara } from '@knicos/genai-base';
import { ContentNodeId, getTopicId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

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
    const contentSvc = useContentService();

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

    const extraTags = t('extraTags', { returnObjects: true }) as string[];

    return (
        <>
            <main className={style.contentSection}>
                <header>
                    <h1>{t('extraTagsTitle')}</h1>
                </header>
                <AlertPara severity="info">{t('hints.describeImages', { max: MAX_TAGS })}</AlertPara>
                <div className={style.tagContainer}>
                    <img
                        src={contentSvc.getContentData(content)}
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
                    const meta = contentSvc.getContentMetadata(content);
                    if (meta && selected) {
                        const tagArray = Array.from(selected);
                        tagArray.forEach((tag) => {
                            meta.labels.push({ label: tag, weight: 1 });
                            contentSvc.graph.addEdge('topic', content, getTopicId(contentSvc.graph, tag));
                        });
                    }
                    onNext();
                }}
            />
        </>
    );
}
