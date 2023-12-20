import ImageSearch from '@genaism/components/ImageSearch/ImageSearch';
import { getTopicLabel } from '@genaism/services/concept/concept';
import { addContent } from '@genaism/services/content/content';
import { ContentNodeId, TopicNodeId } from '@genaism/services/graph/graphTypes';
import { ImageResult } from '@genaism/services/imageSearch/hook';
import { useEffect, useState } from 'react';
import { StageState } from './types';
import style from './style.module.css';
import { addEdge } from '@genaism/services/graph/edges';

interface Props {
    topic: TopicNodeId;
    onAddNext: (stage: StageState[]) => void;
}

export default function ImageSelect({ topic, onAddNext }: Props) {
    const [selected, setSelected] = useState<ContentNodeId[]>([]);

    useEffect(() => {
        if (selected.length === 5) {
            onAddNext(selected.map((s) => ({ view: 'style', contentId: s })));
        }
    }, [selected]);

    const onAdd = (url: string, meta: ImageResult) => {
        addContent(url, { author: meta.author, id: meta.id, labels: [{ label: getTopicLabel(topic), weight: 1 }] });
        addEdge('topic', `content:${meta.id}`, topic, 1);
        setSelected((old) => [...old, `content:${meta.id}`]);
    };

    return (
        <>
            <header>
                <h1>Select 5 Images of "{getTopicLabel(topic)}"</h1>
            </header>
            <div className={style.images}>
                <ImageSearch onAdd={onAdd} />
            </div>
        </>
    );
}
