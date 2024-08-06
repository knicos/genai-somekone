import { ContentNodeId, ContentService } from '@knicos/genai-recom';

interface QueueItem {
    pt: [number, number];
    d: number;
}

/* Breadth First Search, distance sorted */
export function findNearestSlot(grid: unknown[][], pt: [number, number], maxDistance: number): [number, number] {
    const queue: QueueItem[] = [];
    const visited = new Set<number>();
    const dim = grid.length;

    queue.push({ pt, d: 0 });
    visited.add((pt[0] << 8) + pt[1]);

    while (queue.length > 0) {
        const item = queue.pop();
        if (!item) break;

        const gridItem = grid[item.pt[1]]?.[item.pt[0]];

        if (gridItem === null) {
            return item.pt;
        }

        // Add the neighbours.
        const neighbours: [number, number][] = [
            [item.pt[0] + 1, item.pt[1]],
            [item.pt[0] - 1, item.pt[1]],
            [item.pt[0], item.pt[1] + 1],
            [item.pt[0], item.pt[1] - 1],
        ];

        neighbours.forEach((n) => {
            if (n[0] < 0 || n[0] >= dim || n[1] < 0 || n[1] >= dim) {
                return;
            }
            const k = (n[0] << 8) + n[1];
            if (!visited.has(k)) {
                visited.add(k);
                const dx = n[0] - pt[0];
                const dy = n[1] - pt[1];
                const d = dx * dx + dy * dy;
                if (d < maxDistance * maxDistance) {
                    queue.push({ pt: n, d: d });
                }
            }
        });

        queue.sort((a, b) => b.d - a.d);
    }

    return [-1, -1];
}

export function heatmapGrid(content: ContentService, images: ContentNodeId[], dim: number) {
    const start = performance.now();
    const grid: (ContentNodeId | null)[][] = new Array(dim);
    for (let i = 0; i < dim; ++i) {
        const row = new Array<ContentNodeId | null>(dim);
        row.fill(null);
        grid[i] = row;
    }

    images.forEach((image) => {
        const point = content.getContentMetadata(image)?.point || [Math.random(), Math.random()];
        const pt: [number, number] = [Math.round(point[0] * dim), Math.round(point[1] * dim)];
        const nearest = findNearestSlot(grid, pt, 100);
        if (nearest[0] >= 0) {
            grid[nearest[1]][nearest[0]] = image;
        }
    });

    const end = performance.now();
    console.log('Grid time', end - start);

    return grid;
}
