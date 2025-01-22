import { memo, useEffect, useMemo, useRef, useState } from 'react';
import style from './style.module.css';
import cloudLayout, { LocationItem, SizedItem } from '@genaism/visualisations/ImageCloud/cloudLayout';
import { WeightedLabel } from '@knicos/genai-recom';
import { localiser } from '@genaism/services/localiser/localiser';
import { useTranslation } from 'react-i18next';

interface Props {
    content: WeightedLabel[];
    padding?: number;
    size?: number;
    borderSize?: number;
    onSize?: (size: number) => void;
    className?: string;
}

const MIN_SIZE = 15;

const WordCloud = memo(function Cloud({ content, size, padding, onSize, className }: Props) {
    const { i18n } = useTranslation();
    const gRef = useRef<SVGGElement>(null);
    const [locations, setLocations] = useState(new Map<string, LocationItem<string>>());

    useEffect(() => {
        const sizedContent: SizedItem<string>[] = content.map((c, ix) => {
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

        const newMap = new Map<string, LocationItem<string>>();
        results.forEach((r) => newMap.set(r.item.id, r));
        setLocations(newMap);
    }, [content, padding, size, onSize]);

    const maxWeight = useMemo(() => {
        return content.length > 0 ? content[0].weight : 1;
    }, [content]);
    const minWeight = useMemo(() => {
        return content.length > 1 ? content[content.length - 1].weight : 0;
    }, [content]);

    return (
        <g
            data-testid="wordcloud-group"
            ref={gRef}
        >
            {content.map((c, ix) => {
                const l = locations.get(c.label);
                if (c.weight === 0) return null;
                return (
                    <g
                        key={ix}
                        className={className || style.cloudItem}
                        transform={l ? `translate(${l.x}, ${l.y})` : 'translate(0,0)'}
                    >
                        {l && (
                            <rect
                                x={0}
                                y={0}
                                rx="6px"
                                width={l.item.width}
                                height={l.item.height}
                            />
                        )}
                        <text
                            dominantBaseline="middle"
                            textAnchor="middle"
                            fontSize={
                                Math.floor(
                                    ((c.weight - minWeight) / (maxWeight - minWeight)) *
                                        0.1 *
                                        ((size || 500) - MIN_SIZE)
                                ) + MIN_SIZE
                            }
                            data-testid="cloud-image"
                            x={(l?.item.width || 0) / 2}
                            y={(l?.item.height || 0) / 2}
                            visibility={l ? 'visible' : 'hidden'}
                        >
                            {localiser.getLocalisedLabel(c.label, i18n.language)}
                        </text>
                    </g>
                );
            })}
        </g>
    );
});

export default WordCloud;
