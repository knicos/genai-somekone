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

export class Mover {
    private pointers = new Map<number, PointerEvent<SVGSVGElement>>();
    private currentPointers = new Map<number, PointerEvent<SVGSVGElement>>();
    private startZoom: ZoomState;
    private element: SVGSVGElement;
    private extents: [number, number, number, number];
    public movementX = 0;
    public movementY = 0;

    constructor(zoom: ZoomState, extents: [number, number, number, number], svg: SVGSVGElement) {
        this.startZoom = zoom;
        this.element = svg;
        this.extents = extents;
    }

    public move(e: PointerEvent<SVGSVGElement>): ZoomState {
        const pressed = e.pointerType === 'touch' || e.buttons === 1;
        if (pressed && !this.pointers.has(e.pointerId)) this.pointers.set(e.pointerId, e);
        if (pressed) this.currentPointers.set(e.pointerId, e);

        if (this.pointers.size === 2) {
            const ps = Array.from(this.currentPointers.values());
            const psOriginal = ps.map((p) => this.pointers.get(p.pointerId) || p);

            const offsetX = (ps[0].clientX + ps[1].clientX) / 2 / this.element.clientWidth;
            const offsetY = (ps[0].clientY + ps[1].clientY) / 2 / this.element.clientHeight;

            const l = distance(
                psOriginal[0].clientX,
                psOriginal[0].clientY,
                psOriginal[1].clientX,
                psOriginal[1].clientY
            );
            const ll = distance(ps[0].clientX, ps[0].clientY, ps[1].clientX, ps[1].clientY);

            const dl = l - ll;
            const newX = this.extents[0] + this.extents[2] * offsetX;
            const newY = this.extents[1] + this.extents[3] * offsetY;

            return {
                ...this.startZoom,
                cx: newX,
                cy: newY,
                offsetX,
                offsetY,
                duration: 0,
                zoom: Math.max(0.5, this.startZoom.zoom + TOUCH_ZOOM_SPEED * dl * this.startZoom.zoom),
            };
        }

        if (this.pointers.size === 1 && pressed) {
            const oldPointer = this.pointers.get(e.pointerId);
            const mX = oldPointer ? e.screenX - oldPointer.screenX : 0;
            const mY = oldPointer ? e.screenY - oldPointer.screenY : 0;
            this.movementX += Math.abs(mX);
            this.movementY += Math.abs(mY);
            const dx = mX / this.element.clientWidth;
            const dy = mY / this.element.clientHeight;
            return {
                ...this.startZoom,
                duration: 0,
                cx: this.startZoom.cx - dx * this.extents[2],
                cy: this.startZoom.cy - dy * this.extents[3],
            };
        }

        return this.startZoom;
    }
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
