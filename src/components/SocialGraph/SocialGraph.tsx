import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from './ProfileNode';
import Graph, { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '../Graph/Graph';
import { useRecoilValue } from 'recoil';
import {
    settingClusterColouring,
    settingDisplayLines,
    settingEgoOnSelect,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingShowOfflineUsers,
} from '@genaism/state/settingsState';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
// import FakeNode from '../FakeNode/FakeNode';
import style from './style.module.css';

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const linksRef = useRef<Map<string, GraphLink<UserNodeId, UserNodeId>[]>>(
        new Map<string, GraphLink<UserNodeId, UserNodeId>[]>()
    );
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
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();

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
            linkStyles={linkStyles}
            defaultLinkStyle={{
                className: style.link,
                opacity: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                    egoSelect && linkStyles ? 0 : l.strength * l.strength * 0.9,
                width: (l: InternalGraphLink<UserNodeId, UserNodeId>) => 1 + Math.floor(l.strength * l.strength * 30),
            }}
            charge={charge}
            showLines={showLines}
            onSelect={(n: Readonly<GraphNode<UserNodeId>>, l: InternalGraphLink<UserNodeId, UserNodeId>[]) => {
                if (!focusNode) setZoom(0.5);
                setCenter([n.x || 0, n.y || 0]);

                const newStyles = new Map<UserNodeId, LinkStyle<UserNodeId>>();
                newStyles.set(n.id, {
                    className: style.selectedLink,
                    width: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        1 + Math.floor(l.strength * l.strength * 60),
                });

                const conn = new Set<UserNodeId>();
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
                    disabled={egoSelect && connected ? !connected.has(n.id) : false}
                    colourMapping={clusterColouring ? coloursRef.current : undefined}
                />
            ))}
        </Graph>
    );
}
