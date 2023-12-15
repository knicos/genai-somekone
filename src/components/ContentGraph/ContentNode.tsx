import { useEffect, useRef } from 'react';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { getContentData } from '@genaism/services/content/content';

interface Props {
    id: ContentNodeId;
    selected?: boolean;
    disabled?: boolean;
    onResize: (id: string, size: number) => void;
}

export default function ContentNode({ id, selected, onResize, disabled }: Props) {
    const gRef = useRef<SVGGElement>(null);

    useEffect(() => {
        onResize(id, 180);
    }, [id]);

    return (
        <g
            className={disabled ? style.disabledGroup : style.group}
            ref={gRef}
            data-testid={`topic-node-${id}`}
        >
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? 205 : 200}
            />
            <circle
                data-testid="profile-circle"
                r={170}
                fill="white"
                stroke={'#0A869A'}
                strokeWidth={10}
            />
            <image
                href={getContentData(id)}
                width={200}
                height={200}
                x={-100}
                y={-100}
                preserveAspectRatio="none"
                clipPath="inset(0% round 20px)"
            />
        </g>
    );
}
