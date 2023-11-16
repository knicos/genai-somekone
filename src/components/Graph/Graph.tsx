import { useRef, useEffect, useState } from 'react';
import * as d3 from 'd3';
import style from './style.module.css';
import gsap from 'gsap';

interface GraphNode {
    size: number;
    id: string;
    component: JSX.Element;
    x?: number;
    y?: number;
}

interface GraphLink {
    source: string;
    target: string;
}

interface InternalGraphLink {
    source: GraphNode;
    target: GraphNode;
}

interface Extents {
    minX: number;
    minY: number;
    maxX: number;
    maxY: number;
}

function calculateViewBox(extents: Extents): string {
    const w = extents.maxX - extents.minX + 100;
    const h = extents.maxY - extents.minY + 100;
    const x = extents.minX - 50;
    const y = extents.minY - 50;
    return `${x} ${y} ${w} ${h}`;
}

interface Props {
    nodes: GraphNode[];
    links?: GraphLink[];
}

export default function Graph({ nodes, links }: Props) {
    const svgRef = useRef<SVGSVGElement>(null);
    const [nodeList, setNodeList] = useState<GraphNode[]>([]);
    const [linkList, setLinkList] = useState<InternalGraphLink[]>([]);

    useEffect(() => {
        const lnodes = nodes;
        const idMap = new Map<string, GraphNode>();
        nodes.forEach((n) => {
            idMap.set(n.id, n);
        });
        const llinks: InternalGraphLink[] = links
            ? links.map((l) => {
                  const s = idMap.get(l.source);
                  const t = idMap.get(l.target);
                  return s && t ? { source: s, target: t } : { source: lnodes[0], target: lnodes[0] };
              })
            : [];

        const simulation = d3
            .forceSimulation(lnodes)
            .force(
                'collide',
                d3.forceCollide().radius((n) => lnodes[n.index || 0].size)
            )
            .force('link', d3.forceLink(llinks).strength(1))
            .force('charge', d3.forceManyBody().strength(-20000).distanceMax(300))
            .force('x', d3.forceX())
            .force('y', d3.forceY())
            .stop();

        for (
            let i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay()));
            i < n;
            ++i
        ) {
            simulation.tick();
        }

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

        setNodeList(lnodes);
        setLinkList(llinks);

        gsap.to(svgRef.current, {
            attr: {
                viewBox: calculateViewBox(extents),
            },
            duration: 1,
        });
    }, [nodes]);

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
                <g>
                    {linkList.map((l, ix) => (
                        <line
                            key={ix}
                            x1={l.source.x}
                            y1={l.source.y}
                            x2={l.target.x}
                            y2={l.target.y}
                            stroke="black"
                            data-testid={`graph-link-${ix}`}
                        />
                    ))}
                </g>
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
