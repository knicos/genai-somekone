import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from '../ProfileNode/ProfileNode';
import Graph, { GraphLink, GraphNode } from '../Graph/Graph';
// import FakeNode from '../FakeNode/FakeNode';

interface Props {
    liveUsers?: string[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const linksRef = useRef<Map<string, GraphLink[]>>(new Map<string, GraphLink[]>());
    const [links, setLinks] = useState<GraphLink[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);

    const doUpdateLinks = useCallback((id: string, links: GraphLink[]) => {
        console.log('UPDATE LINKS', id, links);
        linksRef.current.set(id, links);
        const newLinks: GraphLink[] = [];
        linksRef.current.forEach((v) => {
            newLinks.push(...v);
        });
        setLinks(newLinks);
    }, []);

    const doRedrawNodes = useCallback(() => {
        setNodes(
            /*users.map((u) => ({
                id: u,
                size: liveSet.has(u) ? sizesRef.current.get(u) || 20 : 5,
                component: liveSet.has(u) ? (
                    <ProfileNode
                        id={u}
                        onLinks={doUpdateLinks}
                        onResize={doResize}
                        key={u}
                    />
                ) : (
                    <FakeNode
                        id={u}
                        onLinks={doUpdateLinks}
                        key={u}
                    />
                ),
            }))*/
            users.map((u) => ({
                id: u,
                size: sizesRef.current.get(u) || 20,
                component: (
                    <ProfileNode
                        id={u}
                        onLinks={doUpdateLinks}
                        onResize={doResize}
                        key={u}
                    />
                ),
            }))
        );
    }, [users, liveSet]);

    const doResize = useCallback(
        (id: string, size: number) => {
            sizesRef.current.set(id, size);
            doRedrawNodes();
        },
        [doRedrawNodes]
    );

    useEffect(() => {
        doRedrawNodes();
    }, [doRedrawNodes]);

    return (
        <Graph
            links={links}
            nodes={nodes}
        />
    );
}
