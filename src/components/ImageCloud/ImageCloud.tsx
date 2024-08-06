import { memo, useEffect, useState } from 'react';
import style from './style.module.css';
import cloudLayout, { LocationItem, SizedItem } from './cloudLayout';
import { ContentNodeId, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

interface Props {
    content: WeightedNode<ContentNodeId>[];
    padding?: number;
    size?: number;
    colour?: string;
    borderSize?: number;
    className?: string;
    onSize?: (size: number) => void;
}

const BORDER_SIZE = 1.5;
const MIN_SIZE = 30;

const ImageCloud = memo(function Cloud({ content, size, padding, colour, borderSize, onSize, className }: Props) {
    const [locations, setLocations] = useState<LocationItem<ContentNodeId>[]>([]);
    const contentSrv = useContentService();

    useEffect(() => {
        const maxWeight = Math.max(0.01, content.length > 0 ? content[0].weight : 1);
        const sizedContent: SizedItem<ContentNodeId>[] = content
            .filter((c) => c.weight > 0)
            .map((c) => {
                const asize = Math.floor((c.weight / maxWeight) * ((size || 500) - MIN_SIZE) * 0.3) + MIN_SIZE;
                return {
                    id: c.id,
                    width: asize,
                    height: asize,
                };
            });

        const [results, maxDist] = cloudLayout(sizedContent, size || 500, padding);
        const floorDist = Math.floor(maxDist);

        if (onSize && floorDist !== size) onSize(floorDist);

        setLocations(results);
    }, [content, padding, size, onSize]);

    const bsize = borderSize === undefined ? BORDER_SIZE : borderSize;

    return (
        <g data-testid="cloud-group">
            {locations.map((l, ix) => (
                <g
                    key={ix}
                    className={className || style.cloudItem}
                    transform={`translate(${l.x}, ${l.y})`}
                >
                    {colour && (
                        <rect
                            x={-bsize}
                            y={-bsize}
                            width={l.item.width + 2 * bsize}
                            height={l.item.height + 2 * bsize}
                            stroke="none"
                            fill={colour}
                            clipPath="inset(0% round 5px)"
                        />
                    )}
                    <image
                        data-testid="cloud-image"
                        x={0}
                        y={0}
                        width={l.item.width}
                        height={l.item.height}
                        href={contentSrv.getContentData(l.item.id)}
                        preserveAspectRatio="none"
                        clipPath="inset(0% round 5px)"
                    />
                </g>
            ))}
        </g>
    );
});

export default ImageCloud;
