import { QTDataItem, addQuadTree, createQuadTree, testQuadTree } from './quadtree';

export interface SizedItem<T extends string> {
    width: number;
    height: number;
    id: T;
}

export interface LocationItem<T extends string> {
    x: number;
    y: number;
    item: SizedItem<T>;
}

function archimedeanSpiral(size: [number, number]) {
    const e = size[0] / size[1];
    return function (t: number) {
        return [e * (t *= 0.1) * Math.cos(t), t * Math.sin(t)];
    };
}

function calculateDistance(minX: number, maxX: number, minY: number, maxY: number): number {
    const d1 = Math.sqrt(minX * minX + minY * minY);
    const d2 = Math.sqrt(maxX * maxX + minY * minY);
    const d3 = Math.sqrt(minX * minX + maxY * maxY);
    const d4 = Math.sqrt(maxX * maxX + maxY * maxY);
    return Math.max(d1, d2, d3, d4);
}

export default function cloudLayout<T extends string>(
    content: SizedItem<T>[],
    size: number,
    padding?: number
): [LocationItem<T>[], number] {
    const results: LocationItem<T>[] = [];
    //let maxDist = 0;

    if (content.length === 0) return [[], padding || 10];

    //const sumWeight = content.reduce((p, v) => p + v.weight, 0) / 2;
    const spiral = archimedeanSpiral([size, size]);
    const tree = createQuadTree(0, 0, 2 * size, 2 * size, 4);
    const tcache = new Map<number, number>();

    let cx = 0;
    let cy = 0;
    let total = 0;

    for (const c of content) {
        const pwidth = c.width + (padding || 10);
        const pheight = c.height + (padding || 10);
        const parea = pwidth * pheight;

        let t = tcache.get(pheight) || 0;

        while (t < 10000) {
            const pos = spiral(t);

            const candidate: QTDataItem = {
                x0: pos[0] - pwidth / 2,
                y0: pos[1] - pheight / 2,
                x1: pos[0] + pwidth / 2,
                y1: pos[1] + pheight / 2,
            };

            if (!testQuadTree(tree, candidate)) {
                tcache.set(pheight, t);
                addQuadTree(tree, candidate);
                results.push({
                    x: Math.floor(candidate.x0),
                    y: Math.floor(candidate.y0),
                    item: c,
                });

                cx += pos[0] * parea;
                cy += pos[1] * parea;
                total += parea;
                break;
            }

            t += 1;
        }
    }

    cx /= total;
    cy /= total;

    const dist = { max: 0 };

    results.forEach((r) => {
        r.x -= cx;
        r.y -= cy;
        const d = calculateDistance(r.x, r.x + r.item.width, r.y, r.y + r.item.height);
        dist.max = Math.max(dist.max, d);
    });
    return [results, dist.max];
}
