import { NodeID } from '@genaism/services/graph/graphTypes';
import { GraphNode } from './types';
import { KeyboardEvent, MouseEvent, PropsWithChildren } from 'react';
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
                    aria-label={n.label}
                    key={ix}
                    transform={`translate(${Math.floor(n.x || 0)},${Math.floor(n.y || 0)})`}
                    onClick={(e: MouseEvent<SVGGElement>) => {
                        if (onSelect) onSelect(n);
                        e.currentTarget.blur();
                        e.stopPropagation();
                    }}
                    className={style.node}
                    tabIndex={0}
                    role="button"
                    onKeyDown={(e: KeyboardEvent<SVGGElement>) => {
                        if (e.key === 'Enter' || e.key === ' ') {
                            if (onSelect) onSelect(n);
                            e.currentTarget.blur();
                            e.stopPropagation();
                        }
                    }}
                >
                    {Array.isArray(children) ? children[ix] : nodeList.length === 1 ? children : null}
                </g>
            ))}
        </g>
    );
}
