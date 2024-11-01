import { NodeID } from '@knicos/genai-recom';
import Graph, { Props } from './Graph';
import { ReactNode, useCallback, useEffect, useState } from 'react';
import { debounce } from '@genaism/util/debounce';
import { GraphLink, GraphNode } from './types';

interface DebounceProps<T extends NodeID> extends Props<T> {
    rateLimit: number;
}

export default function DebounceGraph<T extends NodeID>({
    rateLimit,
    nodes,
    links,
    children,
    ...props
}: DebounceProps<T>) {
    const [dNodes, setDNodes] = useState(nodes);
    const [dLinks, setDLinks] = useState(links);
    const [dChildren, setChildren] = useState(children);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncer = useCallback(
        debounce((n: GraphNode<T>[], c: ReactNode, l?: GraphLink<T, T>[]) => {
            setDNodes(n);
            setDLinks(l);
            setChildren(c);
        }, rateLimit)[0],
        [rateLimit]
    );

    useEffect(() => {
        debouncer(nodes, children, links);
    }, [nodes, links, debouncer, children]);

    return (
        <Graph
            nodes={dNodes}
            links={dLinks}
            {...props}
        >
            {dChildren}
        </Graph>
    );
}
