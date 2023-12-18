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
        cur.size = n.size;
        cur.index = ix;
        if (cur.strength === 0 || focusNode === n.id) {
            cur.fx = cur.x;
            cur.fy = cur.y;
        } else {
            cur.fx = undefined;
            cur.fy = undefined;
        }
        newNodeRef.set(n.id, cur);
    });

    return newNodeRef;
}

export function makeLinks<T extends NodeID>(
    nodes: GraphNode<T>[],
    nodeMap: Map<string, GraphNode<T>>,
    links?: GraphLink<T, T>[]
): InternalGraphLink<T, T>[] {
    return nodes.length > 0 && links
        ? links
              .map((l) => {
                  const s = nodeMap.get(l.source);
                  const t = nodeMap.get(l.target);
                  return s && t
                      ? {
                            source: s,
                            target: t,
                            strength: l.strength,
                        }
                      : { source: nodes[0], target: nodes[0], strength: 0 };
              })
              .filter((l) => l.strength > 0)
        : [];
}
