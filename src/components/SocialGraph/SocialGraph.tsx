import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from './ProfileNode';
import Graph, { GraphLink, GraphNode } from '../Graph/Graph';
import { useRecoilValue } from 'recoil';
import {
    settingDisplayLines,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingShowOfflineUsers,
} from '@genaism/state/settingsState';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
// import FakeNode from '../FakeNode/FakeNode';

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const linksRef = useRef<Map<string, GraphLink<UserNodeId, UserNodeId>[]>>(
        new Map<string, GraphLink<UserNodeId, UserNodeId>[]>()
    );
    const [links, setLinks] = useState<GraphLink<UserNodeId, UserNodeId>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const [nodes, setNodes] = useState<GraphNode<UserNodeId>[]>([]);
    const linkScale = useRecoilValue(settingLinkDistanceScale);
    const showLines = useRecoilValue(settingDisplayLines);
    const charge = useRecoilValue(settingNodeCharge);
    const showOfflineUsers = useRecoilValue(settingShowOfflineUsers);
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);
    const [focusNode, setFocusNode] = useState<string | undefined>();
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number] | undefined>();

    const doUpdateLinks = useCallback((id: string, links: GraphLink<UserNodeId, UserNodeId>[]) => {
        console.log('UPDATE LINKS', id, links);
        linksRef.current.set(id, links);
        const newLinks: GraphLink<UserNodeId, UserNodeId>[] = [];
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
            linkScale={linkScale}
            charge={charge}
            showLines={showLines}
            onSelect={(n: Readonly<GraphNode<UserNodeId>>) => {
                if (!focusNode) setZoom(0.5);
                setCenter([n.x || 0, n.y || 0]);
                setFocusNode(n.id);
            }}
            onUnselect={() => {
                setFocusNode(undefined);
                setZoom(1);
                setCenter([0, 0]);
            }}
            focusNode={focusNode}
            zoom={zoom}
            onZoom={setZoom}
            center={center}
        >
            {nodes.map((n) => (
                <ProfileNode
                    id={n.id}
                    onLinks={doUpdateLinks}
                    onResize={doResize}
                    key={n.id}
                    live={liveSet.has(n.id)}
                    selected={n.id === focusNode}
                />
            ))}
        </Graph>
    );
}
