import { NodeID } from '@knicos/genai-recom';
import Graph, { Props } from './Graph';
import { useCallback, useEffect, useState } from 'react';
import { debounce } from '@genaism/util/debounce';
import { GraphLink, GraphNode } from './types';

interface DebounceProps<T extends NodeID> extends Props<T> {
    rateLimit: number;
}

export default function DebounceGraph<T extends NodeID>({ rateLimit, nodes, links, ...props }: DebounceProps<T>) {
    const [dNodes, setDNodes] = useState(nodes);
    const [dLinks, setDLinks] = useState(links);

    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncer = useCallback(
        debounce((n: GraphNode<T>[], l?: GraphLink<T, T>[]) => {
            setDNodes(n);
            setDLinks(l);
        }, rateLimit)[0],
        [rateLimit]
    );

    useEffect(() => {
        if (nodes.length > 0) debouncer(nodes, links);
    }, [nodes, links, debouncer]);

    return (
        <Graph
            nodes={dNodes}
            links={dLinks}
            {...props}
        />
    );
}
