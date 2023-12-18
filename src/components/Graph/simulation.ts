import { NodeID } from '@genaism/services/graph/graphTypes';
import { GraphNode, InternalGraphLink } from './types';
import * as d3 from 'd3';

export function createSimulation<T extends NodeID>(charge: number, linkScale: number) {
    return d3
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
                        (1 - d.strength) * linkScale * (d.source.size + d.target.size) + (d.source.size + d.target.size)
                    )
                )
        );
    //.stop();
    //.force('attract', d3.forceManyBody().strength(20000).distanceMin(2000))
}
