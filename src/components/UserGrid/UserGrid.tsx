import { UserNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import ProfileNode from '../SocialGraph/ProfileNode';
import {
    KeyboardEvent,
    MouseEvent,
    PointerEvent,
    WheelEvent,
    useCallback,
    useEffect,
    useMemo,
    useRef,
    useState,
} from 'react';
import UserLabel from '../SocialGraph/UserLabel';
import { ZoomState, pointerMove, wheelZoom } from '../Graph/controls';
import gsap from 'gsap';
import FeedPanel from '../SocialGraph/FeedPanel';
import DataPanel from '../SocialGraph/DataPanel';
import ProfilePanel from '../SocialGraph/ProfilePanel';
import RecommendationsPanel from '../SocialGraph/RecommendationsPanel';
import GridMenu from './GridMenu';
import { menuSelectedUser } from '@genaism/state/menuState';
import { useRecoilState } from 'recoil';
import { useNodeType } from '@genaism/services/graph/hooks';
import { getUserName } from '@genaism/services/profiler/profiler';

interface Props {
    users?: UserNodeId[];
}

const SIZE = 100;
const MOVE_THRESHOLD = 10;
const CAMERA_DURATION = 0.3;
const SPACING = 10;
const YSPACING = 40;

interface Extents {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

const DEFAULT_EXTENTS: Extents = {
    minX: -500,
    minY: -500,
    maxX: 500,
    maxY: 500,
};

function calculateViewBox(extents: Extents, zoom: ZoomState): [number, number, number, number] {
    const pw = Math.max(500, extents.maxX - extents.minX);
    const ph = Math.max(500, extents.maxY - extents.minY);
    const w = pw * zoom.zoom;
    const h = ph * zoom.zoom;
    const x = zoom.cx - zoom.offsetX * w;
    const y = zoom.cy - zoom.offsetY * h;
    return [x, y, w, h]; //`${x} ${y} ${w} ${h}`;
}

export default function UserGrid({ users }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [maxSize, setMaxSize] = useState(100);
    const [sizes, setSizes] = useState(new Map<UserNodeId, number>());
    const [focusNode, setFocusNode] = useRecoilState(menuSelectedUser);
    const doResize = useCallback((id: UserNodeId, newSize: number) => {
        setMaxSize((old) => Math.max(old, newSize));
        setSizes((old) => {
            const newMap = new Map<UserNodeId, number>(old);
            newMap.set(id, newSize);
            return newMap;
        });
    }, []);
    const [actualZoom, setActualZoom] = useState<ZoomState>({
        zoom: 5,
        offsetX: 0.5,
        offsetY: 0.5,
        cx: 0,
        cy: 0,
        duration: CAMERA_DURATION,
    });
    const extents = useRef<[number, number, number, number]>([0, 0, 0, 0]);
    const movement = useRef<[number, number]>([0, 0]);
    const pointerCache = useRef(new Map<number, PointerEvent<SVGSVGElement>>());

    const allusers = useNodeType('user');
    const ausers = users ? users : allusers;

    const COLS = Math.ceil(Math.sqrt(ausers.length));
    const ROWS = ausers.length / COLS;

    const size = maxSize + SPACING;
    const ysize = maxSize + YSPACING;

    const nodes = useMemo(
        () =>
            ausers
                .map((user, ix) => ({
                    id: user,
                    label: getUserName(user),
                    size: sizes.get(user) || SIZE,
                    x: -Math.floor(COLS / 2) * size * 2 + (ix % COLS) * size * 2,
                    y: -Math.floor(ROWS / 2) * ysize * 2 + Math.floor(ix / COLS) * ysize * 2,
                }))
                .filter((f) => f.label),
        [ausers, COLS, ROWS, size, ysize, sizes]
    );

    // Animate camera motion
    useEffect(() => {
        // Ensure aspect ratio is correct
        if (svgRef.current) {
            const ratio = svgRef.current.clientHeight / svgRef.current.clientWidth;
            const h = (DEFAULT_EXTENTS.maxX - DEFAULT_EXTENTS.minX) * ratio;
            DEFAULT_EXTENTS.maxY = h / 2;
            DEFAULT_EXTENTS.minY = -h / 2;
        }
        const newExtents = calculateViewBox(DEFAULT_EXTENTS, actualZoom);
        extents.current = newExtents;
        gsap.to(svgRef.current, {
            attr: {
                viewBox: `${Math.floor(newExtents[0])} ${Math.floor(newExtents[1])} ${Math.floor(
                    newExtents[2]
                )} ${Math.floor(newExtents[3])}`,
            },
            duration: actualZoom.duration,
            //ease: 'none',
        });
    }, [actualZoom]);

    return (
        <>
            <svg
                className={style.svg}
                ref={svgRef}
                width="100%"
                height="100%"
                viewBox="-500 -500 1000 1000"
                data-testid="grid-svg"
                onClickCapture={(e: MouseEvent<SVGSVGElement>) => {
                    if (Math.max(movement.current[0], movement.current[1]) > MOVE_THRESHOLD) {
                        movement.current = [0, 0];
                        e.stopPropagation();
                        return;
                    }
                    movement.current = [0, 0];
                    setFocusNode(undefined);
                }}
                onPointerMove={(e: PointerEvent<SVGSVGElement>) => {
                    setActualZoom((oldZoom) => {
                        if (svgRef.current) {
                            return pointerMove(
                                e,
                                oldZoom,
                                extents.current,
                                svgRef.current,
                                pointerCache.current,
                                movement.current
                            );
                        }
                        return oldZoom;
                    });
                }}
                onPointerUp={(e: PointerEvent<SVGSVGElement>) => {
                    pointerCache.current.clear();
                    if (e.pointerType === 'touch') movement.current = [0, 0];
                }}
                onWheel={(e: WheelEvent<SVGSVGElement>) => {
                    setActualZoom((oldZoom) => {
                        if (svgRef.current) {
                            return wheelZoom(e, svgRef.current, extents.current, oldZoom);
                        }
                        return oldZoom;
                    });
                }}
            >
                <g>
                    {nodes.map((node) => (
                        <g
                            className={style.node}
                            key={node.id}
                            transform={`translate(${node.x},${node.y})`}
                            onClick={(e: MouseEvent<SVGGElement>) => {
                                setFocusNode(node.id);
                                e.currentTarget.blur();
                            }}
                            role="button"
                            tabIndex={0}
                            onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    setFocusNode(node.id);
                                    e.currentTarget.blur();
                                }
                            }}
                            aria-label={node.label}
                        >
                            <ProfileNode
                                id={node.id}
                                node={node}
                                onResize={doResize}
                                selected={focusNode === node.id}
                            />
                        </g>
                    ))}
                    {nodes.map((node) => (
                        <g key={node.id}>
                            <UserLabel
                                node={node}
                                scale={actualZoom.zoom}
                            />
                        </g>
                    ))}
                </g>
            </svg>
            <FeedPanel />
            <DataPanel />
            <ProfilePanel />
            <RecommendationsPanel />
            <GridMenu />
        </>
    );
}
