import { PointerEvent, WheelEvent } from 'react';

export interface ZoomState {
    zoom: number;
    offsetX: number;
    offsetY: number;
    cx: number;
    cy: number;
    duration: number;
}

const ZOOM_SPEED = 0.002;
const TOUCH_ZOOM_SPEED = 0.01;
const CAMERA_DURATION = 0.3;

function distance(x1: number, y1: number, x2: number, y2: number): number {
    const dx = x1 - x2;
    const dy = y1 - y2;
    return Math.sqrt(dx * dx + dy * dy);
}

export function pointerMove(
    e: PointerEvent<SVGSVGElement>,
    oldZoom: ZoomState,
    extents: [number, number, number, number],
    svg: SVGSVGElement,
    pointerCache: Map<number, PointerEvent<SVGSVGElement>>,
    movement: [number, number]
): ZoomState {
    if (e.pointerType === 'touch' || e.buttons === 1) pointerCache.set(e.pointerId, e);

    if (pointerCache.size === 2) {
        const ps = Array.from(pointerCache.values());
        const mx1 = ps[0].movementX;
        const mx2 = ps[1].movementX;
        const my1 = ps[0].movementY;
        const my2 = ps[1].movementY;

        const offsetX = (ps[0].clientX + ps[1].clientX) / 2 / (svg.clientWidth || 1);
        const offsetY = (ps[0].clientY + ps[1].clientY) / 2 / (svg.clientHeight || 1);

        const l = distance(ps[0].clientX, ps[0].clientY, ps[1].clientX, ps[1].clientY);
        const ll = distance(ps[0].clientX + mx1, ps[0].clientY + my1, ps[1].clientX + mx2, ps[1].clientY + my2);

        const dl = l - ll;
        const newX = extents[0] + extents[2] * offsetX;
        const newY = extents[1] + extents[3] * offsetY;

        return {
            ...oldZoom,
            cx: newX,
            cy: newY,
            offsetX,
            offsetY,
            duration: 0,
            zoom: Math.max(0.5, oldZoom.zoom + TOUCH_ZOOM_SPEED * dl * oldZoom.zoom),
        };
    }

    if (pointerCache.size === 1 && e.buttons === 1) {
        movement[0] += Math.abs(e.movementX);
        movement[1] += Math.abs(e.movementY);
        const dx = e.movementX / (svg?.clientWidth || 1);
        const dy = e.movementY / (svg?.clientHeight || 1);
        return {
            ...oldZoom,
            duration: 0,
            cx: oldZoom.cx - dx * extents[2],
            cy: oldZoom.cy - dy * extents[3],
        };
    }

    return oldZoom;
}

export function wheelZoom(
    e: WheelEvent<SVGSVGElement>,
    svg: SVGSVGElement,
    extents: [number, number, number, number],
    oldZoom: ZoomState
): ZoomState {
    //if (onZoom) onZoom(newZoom);

    const offsetX = e.clientX / (svg.clientWidth || 1);
    const offsetY = e.clientY / (svg.clientHeight || 1);

    const newX = extents[0] + extents[2] * offsetX;
    const newY = extents[1] + extents[3] * offsetY;
    const newZoom = Math.max(0.5, oldZoom.zoom + e.deltaY * ZOOM_SPEED * oldZoom.zoom);
    return { zoom: newZoom, offsetX, offsetY, cx: newX, cy: newY, duration: CAMERA_DURATION };
}
