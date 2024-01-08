import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from './ProfileNode';
import Graph from '../Graph/Graph';
import { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '../Graph/types';
import { useRecoilState, useRecoilValue } from 'recoil';
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
import ProfilePanel from './ProfilePanel';
import { menuSelectedUser } from '@genaism/state/menuState';
import RecommendationsPanel from './RecommendationsPanel';

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const [links, setLinks] = useState<GraphLink<UserNodeId, UserNodeId>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
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
    const [focusNode, setFocusNode] = useRecoilState(menuSelectedUser);
    const [zoom, setZoom] = useState(5);
    const [center, setCenter] = useState<[number, number] | undefined>();
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();
    const similarPercent = useRecoilValue(settingSimilarPercent);
    const similar = useAllSimilarUsers(users, clusterColouring, clusterColouring ? similarPercent : undefined);

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
            data: {
                colour: similar.colours?.get(u) || (liveSet.has(u) ? '#008297' : '#707070'),
            },
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

    useEffect(() => {
        if (focusNode) {
            const newStyles = new Map<UserNodeId, LinkStyle<UserNodeId>>();
            newStyles.set(focusNode, {
                className: style.selectedLink,
                width: (l: InternalGraphLink<UserNodeId, UserNodeId>) => 1 + Math.floor(l.strength * l.strength * 60),
            });

            const conn = new Set<UserNodeId>();
            conn.add(focusNode);
            links.forEach((link) => {
                if (link.source === focusNode || link.target === focusNode) {
                    conn.add(link.source);
                    conn.add(link.target);
                }
            });

            setConnected(conn);
            setLinkStyles(newStyles);
        }
    }, [focusNode, links]);

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
                onSelect={(n: Readonly<GraphNode<UserNodeId>>) => {
                    if (!focusNode) setZoom(3);
                    setCenter([n.x || 0, n.y || 0]);

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
                        selected={n.id === focusNode}
                        disabled={egoSelect && connected ? !connected.has(n.id) : false}
                    />
                ))}
            </Graph>
            <FeedPanel />
            <DataPanel />
            <ProfilePanel />
            <RecommendationsPanel />
            <SocialMenu />
        </>
    );
}
