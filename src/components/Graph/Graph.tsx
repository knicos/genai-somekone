import { useRef, useEffect, useState, useReducer } from 'react';
import * as d3 from 'd3';
import style from './style.module.css';
import gsap from 'gsap';
import { useRecoilValue } from 'recoil';
import { settingDisplayLines, settingLinkDistanceScale } from '@genaism/state/settingsState';

export interface GraphNode {
    size: number;
    id: string;
    x?: number;
    y?: number;
    component: JSX.Element;
    index?: number;
}

export interface GraphLink {
    source: string;
    target: string;
    strength: number;
}

interface InternalGraphLink {
    source: GraphNode;
    target: GraphNode;
    strength: number;
}

interface Extents {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function calculateViewBox(extents: Extents): string {
    const w = Math.floor(extents.maxX - extents.minX + 100);
    const h = Math.floor(extents.maxY - extents.minY + 100);
    const x = Math.floor(extents.minX - 50);
    const y = Math.floor(extents.minY - 50);
    return `${x} ${y} ${w} ${h}`;
}

interface Props {
    nodes: GraphNode[];
    links?: GraphLink[];
}

export default function Graph({ nodes, links }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [redraw, trigger] = useReducer((a) => ++a, 0);
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);
    const [linkList, setLinkList] = useState<InternalGraphLink[]>([]);
    const nodeRef = useRef<Map<string, GraphNode>>(new Map<string, GraphNode>());
    const simRef = useRef<d3.Simulation<GraphNode, undefined>>();
    const linkScale = useRecoilValue(settingLinkDistanceScale);
    const showLines = useRecoilValue(settingDisplayLines);

    useEffect(() => {
        simRef.current = undefined;
        trigger();
    }, [showLines, linkScale]);

    useEffect(() => {
        if (simRef.current) simRef.current.stop();

        const newNodeRef = new Map<string, GraphNode>();

        nodes.forEach((n, ix) => {
            const cur = nodeRef.current.get(n.id) || { ...n };
            cur.size = n.size;
            cur.component = n.component;
            cur.index = ix;
            newNodeRef.set(n.id, cur);
        });

        nodeRef.current = newNodeRef;

        const lnodes = Array.from(nodeRef.current).map((v) => v[1]);
        //lnodes.sort((a, b) => (b.index || 0) - (a.index || 0));
        //console.log('LNODES', lnodes);

        const llinks: InternalGraphLink[] =
            nodes.length > 0 && links
                ? links.map((l) => {
                      const s = nodeRef.current.get(l.source);
                      const t = nodeRef.current.get(l.target);
                      return s && t
                          ? { source: s, target: t, strength: l.strength }
                          : { source: lnodes[0], target: lnodes[0], strength: 1 };
                  })
                : [];

        // console.log('links', llinks);

        if (!simRef.current) {
            simRef.current = d3
                .forceSimulation<GraphNode>()
                .force(
                    'link',
                    d3
                        .forceLink<GraphNode, InternalGraphLink>()
                        .strength((d) => d.strength)
                        .distance(
                            (d) =>
                                (1 - d.strength) * linkScale * (d.source.size + d.target.size) +
                                (d.source.size + d.target.size)
                        )
                )
                .force(
                    'collide',
                    d3.forceCollide<GraphNode>((n) => {
                        return (n.size || 5) + 10;
                    })
                )
                .force('center', d3.forceCenter());
        }

        setNodeList(lnodes);

        simRef.current.nodes(lnodes);
        simRef.current.force<d3.ForceLink<GraphNode, InternalGraphLink>>('link')?.links(llinks);
        simRef.current
            .on('tick', () => {
                const extents: Extents = {
                    minX: 0,
                    minY: 0,
                    maxX: 0,
                    maxY: 0,
                };

                lnodes.forEach((n) => {
                    extents.minX = Math.min(extents.minX, (n.x || 0) - n.size);
                    extents.minY = Math.min(extents.minY, (n.y || 0) - n.size);
                    extents.maxX = Math.max(extents.maxX, (n.x || 0) + n.size);
                    extents.maxY = Math.max(extents.maxY, (n.y || 0) + n.size);
                });

                //setNodeList([...lnodes]);

                //console.log('LINKS', llinks);

                gsap.to(svgRef.current, {
                    attr: {
                        viewBox: calculateViewBox(extents),
                    },
                    duration: 1,
                });

                setNodeList([...lnodes]);
            })
            .on('end', () => {});
        simRef.current.alpha(0.2).restart();

        setLinkList(llinks);
    }, [nodes, links, redraw]);

    return (
        <svg
            className={style.svg}
            ref={svgRef}
            width="100%"
            height="100%"
            viewBox="-500 -500 1000 1000"
            data-testid="graph-svg"
        >
            <g>
                {showLines && (
                    <g>
                        {linkList.map((l, ix) => (
                            <line
                                key={ix}
                                x1={l.source.x}
                                y1={l.source.y}
                                x2={l.target.x}
                                y2={l.target.y}
                                stroke="#0A869A"
                                opacity={l.strength * l.strength * 0.9}
                                strokeWidth={1 + Math.floor(l.strength * l.strength * 30)}
                                data-testid={`graph-link-${ix}`}
                            />
                        ))}
                    </g>
                )}
                <g>
                    {nodeList.map((n, ix) => (
                        <g
                            key={ix}
                            transform={`translate(${Math.floor(n.x || 0)},${Math.floor(n.y || 0)})`}
                        >
                            {n.component}
                        </g>
                    ))}
                </g>
            </g>
        </svg>
    );
}
