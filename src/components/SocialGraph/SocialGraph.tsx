import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from './ProfileNode';
import Graph from '../Graph/Graph';
import { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '../Graph/types';
import { useRecoilValue } from 'recoil';
import {
    settingClusterColouring,
    settingDisplayLabel,
    settingDisplayLines,
    settingEgoOnSelect,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingShowOfflineUsers,
    settingSimilarPercent,
} from '@genaism/state/settingsState';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
// import FakeNode from '../FakeNode/FakeNode';
import style from './style.module.css';
import { useAllSimilarUsers } from './similarity';
import UserLabel from './UserLabel';
import SocialMenu from './SocialMenu';
import { getCurrentUser } from '@genaism/services/profiler/state';
import FeedPanel from './FeedPanel';
import DataPanel from './DataPanel';

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const [links, setLinks] = useState<GraphLink<UserNodeId, UserNodeId>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const coloursRef = useRef(new Map<string, string>());
    const [nodes, setNodes] = useState<GraphNode<UserNodeId>[]>([]);
    const linkScale = useRecoilValue(settingLinkDistanceScale);
    const showLines = useRecoilValue(settingDisplayLines);
    const charge = useRecoilValue(settingNodeCharge);
    const showOfflineUsers = useRecoilValue(settingShowOfflineUsers);
    const clusterColouring = useRecoilValue(settingClusterColouring);
    const egoSelect = useRecoilValue(settingEgoOnSelect);
    const showLabel = useRecoilValue(settingDisplayLabel);
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);
    const [focusNode, setFocusNode] = useState<UserNodeId | undefined>();
    const [zoom, setZoom] = useState(5);
    const [center, setCenter] = useState<[number, number] | undefined>();
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();
    const similar = useAllSimilarUsers(users);
    const similarPercent = useRecoilValue(settingSimilarPercent);

    useEffect(() => {
        const newLinks: GraphLink<UserNodeId, UserNodeId>[] = [];
        similar.similar.forEach((s, id) => {
            const maxWeight = s.nodes[0]?.weight || 0;
            s.nodes.forEach((node) => {
                if (node.weight >= maxWeight * (1 - similarPercent)) {
                    newLinks.push({
                        source: id,
                        target: node.id,
                        strength: node.weight,
                    });
                }
            });
        });
        setLinks(newLinks);
    }, [similar, similarPercent]);

    const doRedrawNodes = useCallback(() => {
        const filteredUsers = showOfflineUsers
            ? users.filter((u) => u !== getCurrentUser())
            : users.filter((u) => liveSet.has(u) && u !== getCurrentUser());

        // For all nodes not previously seen, and therefore without a position
        // Recursively search for their master node, or become a master node.
        const newNodes = filteredUsers.map((u) => ({
            id: u,
            size: sizesRef.current.get(u) || 100,
            strength: similar.similar.get(u)?.nodes.length || 0,
        }));

        setNodes(newNodes);
    }, [users, liveSet, showOfflineUsers, similar]);

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
        <>
            <Graph
                links={links}
                nodes={nodes}
                linkScale={linkScale}
                linkStyles={linkStyles}
                defaultLinkStyle={{
                    className: style.link,
                    opacity: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        egoSelect && linkStyles ? 0 : l.strength * l.strength * 0.9,
                    width: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        1 + Math.floor(l.strength * l.strength * 30),
                }}
                charge={charge}
                showLines={showLines}
                onSelect={(n: Readonly<GraphNode<UserNodeId>>, l: InternalGraphLink<UserNodeId, UserNodeId>[]) => {
                    if (!focusNode) setZoom(3);
                    setCenter([n.x || 0, n.y || 0]);

                    const newStyles = new Map<UserNodeId, LinkStyle<UserNodeId>>();
                    newStyles.set(n.id, {
                        className: style.selectedLink,
                        width: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                            1 + Math.floor(l.strength * l.strength * 60),
                    });

                    const conn = new Set<UserNodeId>();
                    conn.add(n.id);
                    l.forEach((link) => {
                        conn.add(link.source.id);
                        conn.add(link.target.id);
                    });

                    setConnected(conn);
                    setLinkStyles(newStyles);
                    setFocusNode(n.id);
                }}
                onUnselect={() => {
                    setFocusNode(undefined);
                    setConnected(undefined);
                    setLinkStyles(undefined);
                    setZoom(5);
                    //setCenter([0, 0]);
                }}
                focusNode={focusNode}
                zoom={zoom}
                center={center}
                LabelComponent={showLabel ? UserLabel : undefined}
            >
                {nodes.map((n) => (
                    <ProfileNode
                        id={n.id}
                        node={n}
                        onResize={doResize}
                        key={n.id}
                        live={liveSet.has(n.id)}
                        similarUsers={similar.similar.get(n.id)?.nodes || []}
                        selected={n.id === focusNode}
                        disabled={egoSelect && connected ? !connected.has(n.id) : false}
                        colourMapping={clusterColouring ? coloursRef.current : undefined}
                    />
                ))}
            </Graph>
            <FeedPanel />
            <DataPanel />
            <SocialMenu selectedUser={focusNode} />
        </>
    );
}
