import { useRef } from 'react';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { getContentData } from '@genaism/services/content/content';

interface Props {
    id: ContentNodeId;
    selected?: boolean;
    disabled?: boolean;
    size: number;
}

export default function ContentNode({ id, selected, disabled, size }: Props) {
    const gRef = useRef<SVGGElement>(null);

    return (
        <g
            className={disabled ? style.disabledGroup : style.group}
            ref={gRef}
            data-testid={`topic-node-${id}`}
        >
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? size + 35 : size + 30}
            />
            <circle
                data-testid="profile-circle"
                r={size}
                fill="white"
                stroke={'#0A869A'}
                strokeWidth={10}
                data-nodeitem
            />
            <image
                href={getContentData(id)}
                width={size}
                height={size}
                x={-size / 2}
                y={-size / 2}
                preserveAspectRatio="none"
                clipPath="inset(0% round 20px)"
            />
        </g>
    );
}
