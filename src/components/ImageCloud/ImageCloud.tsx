import { useEffect, useState } from 'react';
import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { QTDataItem, addQuadTree, createQuadTree, testQuadTree } from './quadtree';
import { getContentData } from '@genaism/services/content/content';
import style from './style.module.css';

interface Props {
    content: WeightedNode[];
    padding?: number;
    size?: number;
    colour?: string;
    borderSize?: number;
    onSize?: (size: number) => void;
}

function archimedeanSpiral(size: [number, number]) {
    const e = size[0] / size[1];
    return function (t: number) {
        return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
}

interface LocationItem {
    x: number;
    y: number;
    size: number;
    id: string;
}

const BORDER_SIZE = 1.5;

function calculateDistance(minX: number, maxX: number, minY: number, maxY: number): number {
    const d1 = Math.sqrt(minX * minX + minY * minY);
    const d2 = Math.sqrt(maxX * maxX + minY * minY);
    const d3 = Math.sqrt(minX * minX + maxY * maxY);
    const d4 = Math.sqrt(maxX * maxX + maxY * maxY);
    return Math.max(d1, d2, d3, d4);
}

export default function ImageCloud({ content, size, padding, colour, borderSize, onSize }: Props) {
    const [locations, setLocations] = useState<LocationItem[]>([]);

    useEffect(() => {
        const results: LocationItem[] = [];
        //let maxDist = 0;

        if (content.length > 0) {
            const maxWeight = content[0].weight;
            //const sumWeight = content.reduce((p, v) => p + v.weight, 0) / 2;
            const spiral = archimedeanSpiral([size || 500, size || 500]);
            const tree = createQuadTree(0, 0, size || 500, size || 500, 4);
            const tcache = new Map<number, number>();

            let cx = 0;
            let cy = 0;
            let total = 0;

            for (const c of content) {
                // TODO: Check how many large images there will be and scale accordingly.
                const asize = Math.floor((c.weight / maxWeight) * (size || 500) * 0.3);
                const psize = asize + (padding || 10);

                let t = tcache.get(asize) || 0;

                while (t < 10000) {
                    const pos = spiral(t);

                    const candidate: QTDataItem = {
                        x0: pos[0] - psize / 2,
                        y0: pos[1] - psize / 2,
                        x1: pos[0] + psize / 2,
                        y1: pos[1] + psize / 2,
                    };

                    if (!testQuadTree(tree, candidate)) {
                        tcache.set(asize, t);
                        addQuadTree(tree, candidate);
                        results.push({
                            x: Math.floor(candidate.x0),
                            y: Math.floor(candidate.y0),
                            size: Math.floor(asize),
                            id: c.id,
                        });

                        cx += pos[0] * asize;
                        cy += pos[1] * asize;
                        total += asize;

                        //maxDist = Math.max(maxDist, calculateDistance(candidate));
                        break;
                    }

                    t += 1;
                }
            }

            cx /= total;
            cy /= total;

            const dist = { max: 0 };

            // Calculate centroid
            // Calculate new maxdist
            // Move results to the centroid

            results.forEach((r) => {
                r.x -= cx;
                r.y -= cy;
                const d = calculateDistance(r.x, r.x + r.size, r.y, r.y + r.size);
                dist.max = Math.max(dist.max, d);
            });

            if (onSize) onSize(Math.floor(dist.max));

            setLocations(results);
        }
    }, [content, padding, size, onSize]);

    const bsize = borderSize === undefined ? BORDER_SIZE : borderSize;

    return (
        <g data-testid="cloud-group">
            {locations.map((l, ix) => (
                <g
                    key={ix}
                    className={style.cloudItem}
                    transform={`translate(${l.x}, ${l.y})`}
                >
                    {colour && (
                        <rect
                            x={-bsize}
                            y={-bsize}
                            width={l.size + 2 * bsize}
                            height={l.size + 2 * bsize}
                            stroke="none"
                            fill={colour}
                            clipPath="inset(0% round 5px)"
                        />
                    )}
                    <image
                        data-testid="cloud-image"
                        x={0}
                        y={0}
                        width={l.size}
                        height={l.size}
                        href={getContentData(l.id)}
                        preserveAspectRatio="none"
                        clipPath="inset(0% round 5px)"
                    />
                </g>
            ))}
        </g>
    );
}
