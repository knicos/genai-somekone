import { useRef, useEffect, useState, useReducer, MouseEvent, WheelEvent, PropsWithChildren } from 'react';
import * as d3 from 'd3';
import style from './style.module.css';
import gsap from 'gsap';
import { NodeID } from '@genaism/services/graph/graphTypes';

export interface GraphNode<T extends NodeID> {
    size: number;
    strength?: number;
    id: T;
    x?: number;
    y?: number;
    index?: number;
    fx?: number;
    fy?: number;
}

export interface GraphLink<A extends NodeID, B extends NodeID> {
    source: A;
    target: B;
    strength: number;
}

export interface InternalGraphLink<A extends NodeID, B extends NodeID> {
    source: GraphNode<A>;
    target: GraphNode<B>;
    strength: number;
}

interface Extents {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function calculateViewBox(extents: Extents, padding: number, zoom: number, center: [number, number]): string {
    const pw = Math.max(500, extents.maxX - extents.minX);
    const ph = Math.max(500, extents.maxY - extents.minY);
    const w = Math.floor(pw * zoom + 2 * padding);
    const h = Math.floor(ph * zoom + 2 * padding);
    const x = Math.floor(center[0] - w / 2);
    const y = Math.floor(center[1] - h / 2);
    return `${x} ${y} ${w} ${h}`;
}

type StyleMappingFn<T extends NodeID, R> = (l: InternalGraphLink<T, T>) => R;
type StyleMapping<T extends NodeID, R> = R | StyleMappingFn<T, R>;

export interface LinkStyle<T extends NodeID> {
    className?: StyleMapping<T, string>;
    opacity?: StyleMapping<T, number>;
    width?: StyleMapping<T, number>;
    colour?: StyleMapping<T, string>;
}

interface Props<T extends NodeID> extends PropsWithChildren {
    nodes: GraphNode<T>[];
    links?: GraphLink<T, T>[];
    onSelect?: (node: Readonly<GraphNode<T>>, links: InternalGraphLink<T, T>[]) => void;
    onUnselect?: () => void;
    focusNode?: string;
    zoom?: number;
    center?: [number, number];
    onZoom?: (z: number) => void;
    linkScale?: number;
    showLines?: boolean;
    charge?: number;
    linkStyles?: Map<T, LinkStyle<T>>;
    defaultLinkStyle?: LinkStyle<T>;
}

interface InternalState {
    focusNode?: string;
}

const DEFAULT_STATE: InternalState = {};

const DEFAULT_EXTENTS: Extents = {
    minX: -500,
    minY: -500,
    maxX: 500,
    maxY: 500,
};

const DEFAULT_LINK_STYLE = {
    className: style.link,
};

function defaultNodePosition() {
    const a = Math.random() * 2 * Math.PI;
    const r = Math.random() * 500 + 2000;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

export default function Graph<T extends NodeID>({
    nodes,
    links,
    onSelect,
    onUnselect,
    focusNode,
    zoom = 1,
    onZoom,
    children,
    center,
    linkScale = 6,
    showLines = true,
    charge = 2,
    linkStyles,
    defaultLinkStyle = DEFAULT_LINK_STYLE,
}: Props<T>) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [redraw, trigger] = useReducer((a) => ++a, 0);
    const [nodeList, setNodeList] = useState<GraphNode<T>[]>([]);
    const [linkList, setLinkList] = useState<InternalGraphLink<T, T>[]>([]);
    const nodeRef = useRef<Map<string, GraphNode<T>>>(new Map<string, GraphNode<T>>());
    const simRef = useRef<d3.Simulation<GraphNode<T>, undefined>>();
    const internalState = useRef<InternalState>(DEFAULT_STATE);
    const [extents, setExtents] = useState<Extents>(DEFAULT_EXTENTS);
    const [actualCenter, setActualCenter] = useState<[number, number]>([0, 0]);

    internalState.current.focusNode = focusNode;

    useEffect(() => {
        if (center) {
            setActualCenter(center);
        }
    }, [center]);

    useEffect(() => {
        simRef.current = undefined;
        trigger();
    }, [showLines, linkScale, charge]);

    useEffect(() => {
        if (simRef.current) simRef.current.stop();

        const newNodeRef = new Map<string, GraphNode<T>>();

        nodes.forEach((n, ix) => {
            const cur = nodeRef.current.get(n.id) || {
                ...n,
                ...defaultNodePosition(),
            };
            cur.size = n.size;
            cur.index = ix;
            if (cur.strength === 0 || internalState.current.focusNode === n.id) {
                cur.fx = cur.x;
                cur.fy = cur.y;
            } else {
                cur.fx = undefined;
                cur.fy = undefined;
            }
            newNodeRef.set(n.id, cur);
        });

        nodeRef.current = newNodeRef;

        const lnodes = Array.from(nodeRef.current).map((v) => v[1]);

        const llinks: InternalGraphLink<T, T>[] =
            nodes.length > 0 && links
                ? links
                      .map((l) => {
                          const s = nodeRef.current.get(l.source);
                          const t = nodeRef.current.get(l.target);
                          return s && t
                              ? {
                                    source: s,
                                    target: t,
                                    strength: l.strength,
                                }
                              : { source: lnodes[0], target: lnodes[0], strength: 0 };
                      })
                      .filter((l) => l.strength > 0)
                : [];

        // console.log('links', llinks);

        if (!simRef.current) {
            simRef.current = d3
                .forceSimulation<GraphNode<T>>()
                .force('center', d3.forceCenter())
                .force(
                    'collide',
                    d3.forceCollide<GraphNode<T>>((n) => {
                        return (n.size || 5) + 10;
                    })
                )
                .force(
                    'charge',
                    d3
                        .forceManyBody<GraphNode<T>>()
                        .strength(-10000 * charge)
                        //.strength((d) => (1 - (d.strength || 0)) * -10000 * charge) // -10000 * charge)
                        .distanceMin(50)
                        .distanceMax(10000)
                )
                .force(
                    'link',
                    d3
                        .forceLink<GraphNode<T>, InternalGraphLink<T, T>>()
                        .strength((d) => d.strength * 0.9 + 0.1)
                        .distance((d) =>
                            Math.max(
                                10,
                                (1 - d.strength) * linkScale * (d.source.size + d.target.size) +
                                    (d.source.size + d.target.size)
                            )
                        )
                );
            //.stop();
            //.force('attract', d3.forceManyBody().strength(20000).distanceMin(2000))
        }

        setNodeList(lnodes);

        simRef.current.nodes(lnodes);
        simRef.current.force<d3.ForceLink<GraphNode<T>, InternalGraphLink<T, T>>>('link')?.links(llinks);
        simRef.current
            .on('tick', () => {
                setNodeList([...lnodes]);
            })
            .on('end', () => {});
        simRef.current.alpha(0.3).restart();

        setLinkList(llinks);
    }, [nodes, links, redraw]);

    useEffect(() => {
        const newExtents: Extents = {
            minX: 10000,
            minY: 10000,
            maxX: -10000,
            maxY: -10000,
        };

        nodeList.forEach((n) => {
            newExtents.minX = Math.min(newExtents.minX, (n.x || 0) - n.size);
            newExtents.minY = Math.min(newExtents.minY, (n.y || 0) - n.size);
            newExtents.maxX = Math.max(newExtents.maxX, (n.x || 0) + n.size);
            newExtents.maxY = Math.max(newExtents.maxY, (n.y || 0) + n.size);
        });
        setExtents(newExtents);
    }, [nodeList]);

    useEffect(() => {
        gsap.to(svgRef.current, {
            attr: {
                viewBox: calculateViewBox(extents, 50, zoom, actualCenter),
            },
            duration: 0.3,
            //ease: 'none',
        });
    }, [zoom, extents, actualCenter]);

    return (
        <svg
            className={style.svg}
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="-500 -500 1000 1000"
            data-testid="graph-svg"
            onClick={() => onUnselect && onUnselect()}
            onWheel={(e: WheelEvent<SVGSVGElement>) => onZoom && onZoom(Math.max(0.1, zoom + e.deltaY * 0.002))}
        >
            <g>
                {showLines && (
                    <g>
                        {linkList.map((l, ix) => {
                            if (l.target.id === ('dummy' as T)) return null;
                            const styles =
                                linkStyles?.get(l.source.id) || linkStyles?.get(l.target.id) || defaultLinkStyle;
                            return (
                                <line
                                    className={
                                        typeof styles?.className === 'function'
                                            ? styles.className(l)
                                            : styles?.className || style.link
                                    }
                                    key={ix}
                                    x1={l.source.x}
                                    y1={l.source.y}
                                    x2={l.target.x}
                                    y2={l.target.y}
                                    opacity={
                                        typeof styles?.opacity === 'function' ? styles.opacity(l) : styles?.opacity
                                    }
                                    strokeWidth={typeof styles?.width === 'function' ? styles.width(l) : styles?.width}
                                    data-testid={`graph-link-${ix}`}
                                />
                            );
                        })}
                    </g>
                )}
                <g>
                    {nodeList.map((n, ix) => (
                        <g
                            key={ix}
                            transform={`translate(${Math.floor(n.x || 0)},${Math.floor(n.y || 0)})`}
                            onClick={(e: MouseEvent<SVGGElement>) => {
                                if (onSelect)
                                    onSelect(
                                        n,
                                        linkList.filter((l) => l.source.id === n.id || l.target.id === n.id)
                                    );
                                e.stopPropagation();
                            }}
                            className={style.node}
                        >
                            {Array.isArray(children) ? children[ix] : nodeList.length === 1 ? children : null}
                        </g>
                    ))}
                </g>
            </g>
        </svg>
    );
}
