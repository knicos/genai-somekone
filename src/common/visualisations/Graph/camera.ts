import { NodeID } from '@genai-fi/recom';
import { GraphNode } from './types';
import { ZoomState } from './controls';

export interface Extents {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

export const DEFAULT_EXTENTS: Extents = {
    minX: -500,
    minY: -500,
    maxX: 500,
    maxY: 500,
};

export function calculateViewBox(extents: Extents, zoom: ZoomState): [number, number, number, number] {
    const pw = Math.max(500, extents.maxX - extents.minX);
    const ph = Math.max(500, extents.maxY - extents.minY);
    const w = pw * zoom.zoom;
    const h = ph * zoom.zoom;
    const x = zoom.cx - zoom.offsetX * w;
    const y = zoom.cy - zoom.offsetY * h;
    return [x, y, w, h]; //`${x} ${y} ${w} ${h}`;
}

export function calcExtents<T extends NodeID>(nodes: GraphNode<T>[]): Extents {
    let minX = Number.MAX_SAFE_INTEGER;
    let maxX = Number.MIN_SAFE_INTEGER;
    let minY = Number.MAX_SAFE_INTEGER;
    let maxY = Number.MIN_SAFE_INTEGER;

    nodes.forEach((node) => {
        minX = Math.min(minX, (node.x || 0) - node.size * 2);
        maxX = Math.max(maxX, (node.x || 0) + node.size * 2);
        minY = Math.min(minY, (node.y || 0) - node.size * 2);
        maxY = Math.max(maxY, (node.y || 0) + node.size * 2);
    });

    return { minX, maxX, minY, maxY };
}

export function calcAutoCamera(extents: Extents): ZoomState {
    const { maxX, minX, minY, maxY } = extents;

    const zoom =
        Math.round(
            Math.max(
                (maxX - minX) / (DEFAULT_EXTENTS.maxX - DEFAULT_EXTENTS.minX),
                (maxY - minY) / (DEFAULT_EXTENTS.maxY - DEFAULT_EXTENTS.minY)
            ) * 100
        ) / 100;

    return {
        cx: Math.round(((minX + maxX) / 2) * 10) / 10,
        cy: Math.round(((minY + maxY) / 2) * 10) / 10,
        offsetX: 0.5,
        offsetY: 0.5,
        duration: 0.3,
        zoom: Math.max(0.5, zoom),
    };
}
