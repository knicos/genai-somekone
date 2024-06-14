import { NodeID } from '@genaism/services/graph/graphTypes';
import { GraphLink, GraphNode, InternalGraphLink } from './types';

function defaultNodePosition() {
    const a = Math.random() * 2 * Math.PI;
    const r = Math.random() * 500 + 2000;
    return { x: r * Math.cos(a), y: r * Math.sin(a) };
}

export function makeNodes<T extends NodeID>(
    nodes: GraphNode<T>[],
    nodeMap: Map<string, GraphNode<T>>,
    focusNode?: string
) {
    const newNodeRef = new Map<string, GraphNode<T>>();

    nodes.forEach((n, ix) => {
        const cur = nodeMap.get(n.id) || {
            ...n,
            ...defaultNodePosition(),
        };
        cur.strength = n.strength;
        cur.size = n.size;
        cur.index = ix;
        cur.data = n.data;
        if (cur.strength === 0 || focusNode === n.id) {
            cur.fx = cur.x;
            cur.fy = cur.y;
        } else {
            cur.fx = n.fx;
            cur.fy = n.fy;
        }
        newNodeRef.set(n.id, cur);
    });

    return newNodeRef;
}

export function makeLinks<T extends NodeID>(
    nodeMap: Map<string, GraphNode<T>>,
    links?: GraphLink<T, T>[]
): InternalGraphLink<T, T>[] {
    const linkMap = new Map<string, InternalGraphLink<T, T>>();

    links?.forEach((link) => {
        if ((link.actualStrength || 0) <= 0) return;
        if (linkMap.has(`${link.target}-${link.source}`)) return;

        const s = nodeMap.get(link.source);
        const t = nodeMap.get(link.target);

        if (s && t) {
            linkMap.set(`${link.source}-${link.target}`, {
                source: s,
                target: t,
                strength: link.strength,
                actualStrength: link.actualStrength,
            });
        }
    });

    return Array.from(linkMap.values());
}
