import { useEffect, useRef, useState } from 'react';
import style from './style.module.css';

export interface Props {
    label: string;
    fontSize?: string | number;
    fill?: string;
    color?: string;
    padding?: number;
    borderRadius?: number;
    scale?: number;
    onResize?: (size: number) => void;
}

export default function LabelContent({
    label,
    fontSize,
    fill,
    scale = 1,
    color,
    padding = 0,
    borderRadius,
    onResize,
}: Props) {
    const gRef = useRef<SVGGElement>(null);
    const [size, setSize] = useState<[number, number]>([50, 20]);

    useEffect(() => {
        if (gRef.current) {
            const childText = gRef.current.querySelector('text');
            const bbox = childText && childText.getBBox ? childText.getBBox() : null;

            if (bbox) {
                setSize([bbox.width + 30, bbox.height]);
                if (onResize) onResize(Math.max((bbox.width + 30) / 2 + padding + 5, bbox.height / 2 + padding + 5));
            }
        }
    }, [label, fontSize, padding, onResize]);

    return (
        <g
            ref={gRef}
            transform={`scale(${scale * 0.4})`}
            className={style.label}
        >
            <rect
                x={Math.floor(-size[0] / 2 - (padding || 0))}
                y={Math.floor(-size[1] / 2 - (padding || 0))}
                rx={borderRadius || 10}
                width={Math.floor(size[0] + 2 * (padding || 0))}
                height={Math.floor(size[1] + 2 * (padding || 0))}
                fill={fill || 'white'}
            />
            <text
                textAnchor="middle"
                dominantBaseline="middle"
                fontSize={fontSize || 30}
                fontWeight="bold"
                fill={color || 'black'}
            >
                {label}
            </text>
        </g>
    );
}
