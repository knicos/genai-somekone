import { useEffect, useRef, useState } from 'react';

interface Props {
    label: string;
    x: number;
    y: number;
    fontSize?: string | number;
    fill?: string;
    color?: string;
    padding?: number;
    borderRadius?: number;
    onResize?: (size: number) => void;
}

export default function Label({ label, x, y, fontSize, fill, color, padding = 0, borderRadius, onResize }: Props) {
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
    }, [label, fontSize, padding]);

    return (
        <g
            ref={gRef}
            transform={`translate(${x}, ${y})`}
        >
            <rect
                x={-size[0] / 2 - (padding || 0)}
                y={-size[1] / 2 - (padding || 0)}
                rx={borderRadius || 10}
                width={size[0] + 2 * (padding || 0)}
                height={size[1] + 2 * (padding || 0)}
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
