import ImageSearch from '@genaism/components/ImageSearch/ImageSearch';
import { getTopicLabel } from '@genaism/services/concept/concept';
import { addContent, removeContent } from '@genaism/services/content/content';
import { ContentNodeId, TopicNodeId } from '@genaism/services/graph/graphTypes';
import { ImageResult } from '@genaism/services/imageSearch/hook';
import { useCallback, useEffect, useState } from 'react';
import { StageState } from './types';
import style from './style.module.css';
import { addEdge } from '@genaism/services/graph/edges';
import Stepper from './Stepper';
import DeletableImage from './DeletableImage';
import { useTranslation } from 'react-i18next';
import HideImageIcon from '@mui/icons-material/HideImage';

const MIN_IMAGES = 2;
const MAX_IMAGES = 10;

interface Props {
    topic: TopicNodeId;
    onAddNext: (stage: StageState[]) => void;
    onNext: () => void;
}

export default function ImageSelect({ topic, onAddNext, onNext }: Props) {
    const { t } = useTranslation('creator');
    const [selected, setSelected] = useState<ContentNodeId[]>([]);
    const [selSet, setSelSet] = useState<Set<string>>();
    const [isdone, setDone] = useState(false);

    useEffect(() => {
        if (selected.length >= MIN_IMAGES) {
            const confirm: StageState = { view: 'confirm' };
            onAddNext([...selected.map((s) => ({ view: 'describe', contentId: s } as StageState)), confirm]);
            setDone(true);
        } else {
            setDone(false);
        }
    }, [selected, onAddNext]);

    const onAdd = useCallback(
        (url: string, meta: ImageResult) => {
            addContent(url, { author: meta.author, id: meta.id, labels: [{ label: getTopicLabel(topic), weight: 1 }] });
            addEdge('topic', `content:${meta.id}`, topic, 1);
            setSelected((old) => [...old, `content:${meta.id}`]);
        },
        [topic]
    );

    const doDelete = useCallback((id: ContentNodeId) => {
        removeContent(id);
        setSelSet((old) => {
            const newset = new Set<string>(old);
            newset.delete(id.split(':')[1]);
            return newset;
        });
        setSelected((old) => old.filter((o) => o !== id));
    }, []);

    const columns = Math.min(4, Math.ceil(Math.min(1200, window.innerWidth) / 400));

    const selectionList = Array.from({ length: MAX_IMAGES }, (_, ix) => selected[ix] || null);

    return (
        <>
            <main className={style.contentSection}>
                <header className={style.imageHeader}>
                    <h1>{t('imageSelectTitle', { minImages: MIN_IMAGES, label: getTopicLabel(topic) })}</h1>
                </header>
                <ul className={style.selectedImages}>
                    {selectionList.map((s, ix) =>
                        s ? (
                            <DeletableImage
                                id={s}
                                onDelete={doDelete}
                                key={ix}
                            />
                        ) : (
                            <div
                                key={ix}
                                className={style.placeholderImage}
                            >
                                <HideImageIcon
                                    color="inherit"
                                    fontSize="large"
                                />
                            </div>
                        )
                    )}
                </ul>
                <div className={style.images}>
                    <ImageSearch
                        columns={columns}
                        onAdd={onAdd}
                        selected={selSet}
                        onSelect={(id: string) => {
                            const newset = new Set<string>(selSet);
                            newset.add(id);
                            setSelSet(newset);
                        }}
                        disabled={selected.length >= MAX_IMAGES}
                    />
                </div>
            </main>
            <Stepper onNext={isdone ? onNext : undefined} />
        </>
    );
}
