import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from '../ProfileNode/ProfileNode';
import Graph, { GraphLink, GraphNode } from '../Graph/Graph';
import { useRecoilValue } from 'recoil';
import { settingShowOfflineUsers } from '@genaism/state/settingsState';
// import FakeNode from '../FakeNode/FakeNode';

interface Props {
    liveUsers?: string[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const linksRef = useRef<Map<string, GraphLink[]>>(new Map<string, GraphLink[]>());
    const [links, setLinks] = useState<GraphLink[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const [nodes, setNodes] = useState<GraphNode[]>([]);
    const showOfflineUsers = useRecoilValue(settingShowOfflineUsers);
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
        const filteredUsers = showOfflineUsers ? users : users.filter((u) => liveSet.has(u));
        setNodes(
            filteredUsers.map((u) => ({
                id: u,
                size: sizesRef.current.get(u) || 20,
                component: (
                    <ProfileNode
                        id={u}
                        onLinks={doUpdateLinks}
                        onResize={doResize}
                        key={u}
                        live={liveSet.has(u)}
                    />
                ),
            }))
        );
    }, [users, liveSet, showOfflineUsers]);

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
