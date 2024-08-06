import ImageSearch from '@genaism/components/ImageSearch/ImageSearch';
import { ImageResult, SearchSource } from '@genaism/services/imageSearch/hook';
import { useCallback, useEffect, useState } from 'react';
import { StageState } from './types';
import style from './style.module.css';
import Stepper from './Stepper';
import DeletableImage from './DeletableImage';
import { useTranslation } from 'react-i18next';
import HideImageIcon from '@mui/icons-material/HideImage';
import { useSetRecoilState } from 'recoil';
import { unsavedChanges } from '@genaism/state/interaction';
import { useSearchParams } from 'react-router-dom';
import { ContentNodeId, getTopicLabel, TopicNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

const MIN_IMAGES = 10;
const MAX_IMAGES = 20;

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
    const setUnsaved = useSetRecoilState(unsavedChanges);
    const [params] = useSearchParams();
    const contentSvc = useContentService();

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
            contentSvc.addContent(url, {
                author: meta.author,
                id: meta.id,
                labels: [{ label: getTopicLabel(topic), weight: 1 }],
            });
            contentSvc.graph.addEdge('topic', `content:${meta.id}`, topic, 1);
            setSelected((old) => [...old, `content:${meta.id}`]);
            setUnsaved(true);
        },
        [topic, setUnsaved, contentSvc]
    );

    const doDelete = useCallback(
        (id: ContentNodeId) => {
            contentSvc.removeContent(id);
            setSelSet((old) => {
                const newset = new Set<string>(old);
                newset.delete(id.split(':')[1]);
                return newset;
            });
            setSelected((old) => old.filter((o) => o !== id));
        },
        [contentSvc]
    );

    const columns = Math.min(4, Math.ceil(Math.min(1200, window.innerWidth) / 400));

    const selectionList = Array.from(
        { length: Math.max(MIN_IMAGES, selected.length + 1) },
        (_, ix) => selected[ix] || null
    );

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
                        source={(params.get('source') as SearchSource) || 'pixabay'}
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
