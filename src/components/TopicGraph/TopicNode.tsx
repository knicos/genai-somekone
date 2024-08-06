import { useEffect, useRef, useState } from 'react';
import style from './style.module.css';
import { getTopicLabel, TopicNodeId } from '@knicos/genai-recom';

interface Props {
    id: TopicNodeId;
    selected?: boolean;
    onResize: (id: string, size: number) => void;
}

export default function TopicNode({ id, selected, onResize }: Props) {
    const gRef = useRef<SVGGElement>(null);
    const [size, setSize] = useState(100);
    const asize = size;

    useEffect(() => {
        if (gRef.current) {
            const childText = gRef.current.querySelector('text');
            const bbox = childText && childText.getBBox ? childText.getBBox() : null;

            if (bbox) {
                const newSize = Math.floor(bbox.width / 2 + 30);
                setSize(newSize);
                onResize(id, newSize);
            }
        }
    }, [id, onResize]);

    return (
        <g
            className={style.group}
            ref={gRef}
            data-testid="topic-node"
        >
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? asize + 20 : asize}
            />
            <circle
                data-nodeitem
                data-testid="profile-circle"
                r={asize}
                fill="white"
                stroke={'#0A869A'}
                strokeWidth={10}
            />
            <text
                y={0}
                x={0}
                fontSize="40px"
                dominantBaseline="middle"
                textAnchor="middle"
            >
                {getTopicLabel(id)}
            </text>
        </g>
    );
}
