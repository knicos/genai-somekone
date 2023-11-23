import { useEffect, useMemo, useRef, useState } from 'react';
import style from './style.module.css';
import cloudLayout, { LocationItem, SizedItem } from '@genaism/components/ImageCloud/cloudLayout';
import { WeightedLabel } from '@genaism/services/content/contentTypes';

interface Props {
    content: WeightedLabel[];
    padding?: number;
    size?: number;
    colour?: string;
    borderSize?: number;
    onSize?: (size: number) => void;
}

export default function WordCloud({ content, size, padding, onSize, colour }: Props) {
    const gRef = useRef<SVGGElement>(null);
    const [locations, setLocations] = useState(new Map<string, LocationItem>());

    useEffect(() => {
        const sizedContent: SizedItem[] = content.map((c, ix) => {
            const child = gRef.current?.children[ix];
            const childText = (child as SVGGElement)?.querySelector('text');
            const bbox =
                childText && childText.getBBox
                    ? childText.getBBox()
                    : {
                          x: 0,
                          y: 0,
                          width: 50,
                          height: 20,
                      };

            if (!bbox || bbox.width <= 5 || bbox.height <= 5) return { id: c.label, width: 0, height: 0 };

            return {
                id: c.label,
                width: bbox.width + 20,
                height: bbox.height,
            };
        });

        const [results, maxDist] = cloudLayout(
            sizedContent.filter((s) => s.width > 5 && s.height > 5),
            size || 500,
            padding
        );

        if (onSize) onSize(Math.floor(maxDist));

        const newMap = new Map<string, LocationItem>();
        results.forEach((r) => newMap.set(r.item.id, r));
        setLocations(newMap);
    }, [content, padding, size, onSize]);

    const maxWeight = useMemo(() => {
        return content.length > 0 ? content[0].weight : 1;
    }, [content]);

    return (
        <g
            data-testid="cloud-group"
            ref={gRef}
        >
            {content.map((c, ix) => {
                const l = locations.get(c.label);
                return (
                    <g
                        key={ix}
                        className={style.cloudItem}
                        transform={l ? `translate(${l.x}, ${l.y})` : 'translate(0,0)'}
                    >
                        {l && (
                            <rect
                                x={0}
                                y={0}
                                rx="6px"
                                width={l.item.width}
                                height={l.item.height}
                                fill={colour || 'black'}
                                opacity="0.2"
                            />
                        )}
                        <text
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontSize={Math.floor((c.weight / maxWeight) * 0.1 * (size || 500))}
                            data-testid="cloud-image"
                            x={(l?.item.width || 0) / 2}
                            y={(l?.item.height || 0) / 2}
                            visibility={l ? 'visible' : 'hidden'}
                        >
                            {c.label}
                        </text>
                    </g>
                );
            })}
        </g>
    );
}
