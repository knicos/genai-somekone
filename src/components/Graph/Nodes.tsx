import { NodeID } from '@genaism/services/graph/graphTypes';
import { GraphNode } from './types';
import { MouseEvent, PropsWithChildren } from 'react';
import style from './style.module.css';

interface Props<T extends NodeID> extends PropsWithChildren {
    nodeList: GraphNode<T>[];
    onSelect?: (node: Readonly<GraphNode<T>>) => void;
}

export default function Nodes<T extends NodeID>({ nodeList, onSelect, children }: Props<T>) {
    return (
        <g>
            {nodeList.map((n, ix) => (
                <g
                    key={ix}
                    transform={`translate(${Math.floor(n.x || 0)},${Math.floor(n.y || 0)})`}
                    onClick={(e: MouseEvent<SVGGElement>) => {
                        if (onSelect)
                            onSelect(
                                n
                                //linkList.filter((l) => l.source.id === n.id || l.target.id === n.id)
                            );
                        e.stopPropagation();
                    }}
                    className={style.node}
                >
                    {Array.isArray(children) ? children[ix] : nodeList.length === 1 ? children : null}
                </g>
            ))}
        </g>
    );
}
