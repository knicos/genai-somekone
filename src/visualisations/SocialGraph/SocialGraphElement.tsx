import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ProfileNode from './ProfileNode';
import { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '../Graph/types';
import { useRecoilState, useRecoilValue } from 'recoil';
import {
    settingClusterColouring,
    settingDisplayLabel,
    settingDisplayLines,
    settingEgoOnSelect,
    settingIncludeAllLinks,
    settingSocialGraphScale,
    settingShowOfflineUsers,
    settingSocialGraphTheme,
    settingSimilarPercent,
    settingLinkLimit,
    settingAutoCamera,
    settingAutoEdges,
    settingSocialNodeMenu,
} from '@genaism/state/settingsState';
// import FakeNode from '../FakeNode/FakeNode';
import style from './style.module.css';
import UserLabel from './UserLabel';
import { menuSelectedUser } from '@genaism/state/menuState';
import { UserNodeId } from '@knicos/genai-recom';
import { useServices } from '@genaism/hooks/services';
import { calculateParameters } from './parameters';
import graphThemes from './graphTheme';
import UserMenu from './UserMenu';
import { generateLinks } from './links';
import Graph from '../Graph/Graph';
import { useSimilarityData } from '@genaism/hooks/similarity';
import { patchNodes } from './nodes';

const LINE_THICKNESS_UNSELECTED = 40;
const MIN_LINE_THICKNESS = 10;
const LINE_THICKNESS_SELECTED = 60;
const DENSITY_LOW = 0.01;
const DENSITY_HIGH = 0.03;

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraphElement({ liveUsers }: Props) {
    // Internal refs
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const currentZoom = useRef(1);
    const userElement = useRef<SVGElement>();

    // State
    const [links, setLinks] = useState<GraphLink<UserNodeId, UserNodeId>[]>([]);
    const [nodes, setNodes] = useState<GraphNode<UserNodeId>[]>([]);
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();
    const [userMenu, setUserMenu] = useState<[number, number] | undefined>();

    // Global state
    const [focusNode, setFocusNode] = useRecoilState(menuSelectedUser);

    // Settings
    const scale = useRecoilValue(settingSocialGraphScale);
    const showLines = useRecoilValue(settingDisplayLines);
    const showOfflineUsers = useRecoilValue(settingShowOfflineUsers);
    const clusterColouring = useRecoilValue(settingClusterColouring);
    const linkLimit = useRecoilValue(settingLinkLimit);
    const egoSelect = useRecoilValue(settingEgoOnSelect);
    const showLabel = useRecoilValue(settingDisplayLabel);
    const allLinks = useRecoilValue(settingIncludeAllLinks);
    const themeName = useRecoilValue(settingSocialGraphTheme);
    const autoCamera = useRecoilValue(settingAutoCamera);
    const autoEdges = useRecoilValue(settingAutoEdges);
    const showNodeMenu = useRecoilValue(settingSocialNodeMenu);

    const [similarPercent, setSimilarPercent] = useRecoilState(settingSimilarPercent);

    // External or calculated data
    const similar = useSimilarityData();
    const users = similar.users;
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);
    const { profiler, similarity } = useServices();

    const { nodeCharge, linkDistance, density } = calculateParameters(
        scale,
        window.innerWidth * window.innerHeight,
        nodes.length
    );

    const theme = graphThemes[themeName];

    // Update cluster K setting
    useEffect(() => {
        similarity.setK(clusterColouring);
    }, [similarity, clusterColouring]);

    // Update links if link parameters or inputs change
    useEffect(() => {
        const newLinks = generateLinks(similar.similar, allLinks, similarPercent, linkLimit);
        setLinks(newLinks);
    }, [similar, similarPercent, allLinks, linkLimit, setLinks]);

    // Update nodes if node data changes
    useEffect(() => {
        setNodes((oldNodes) => {
            const filteredUsers = showOfflineUsers
                ? users.filter((u) => u !== profiler.getCurrentUser() && (similar.similar.get(u)?.length || 0) > 0)
                : users.filter((u) => liveSet.has(u) && u !== profiler.getCurrentUser());

            return patchNodes(profiler, oldNodes, filteredUsers, sizesRef.current, similar);
        });
    }, [users, liveSet, showOfflineUsers, similar, profiler, setNodes]);

    const doResize = useCallback(
        (id: string, size: number) => {
            if (Math.abs(size - (sizesRef.current.get(id) || 100)) <= 1) return;
            sizesRef.current.set(id, size);

            setNodes((oldNodes) =>
                oldNodes.map((node) => {
                    if (node.id === id) {
                        node.size = size;
                        return { ...node };
                    } else {
                        return node;
                    }
                })
            );
        },
        [setNodes]
    );

    useEffect(() => {
        if (focusNode) {
            const newStyles = new Map<UserNodeId, LinkStyle<UserNodeId>>();
            newStyles.set(focusNode, {
                className: style.selectedLink,
                width: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                    1 + Math.floor((l.actualStrength || l.strength) * LINE_THICKNESS_SELECTED),
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
        } else {
            setConnected(undefined);
            setLinkStyles(undefined);
        }
    }, [focusNode, links]);

    const doNodeDensity = useCallback(
        (d: number) => {
            const ad = d * scale;
            if (ad > 0 && ad < DENSITY_LOW) {
                setSimilarPercent((old) => Math.min(0.5, 1.1 * old));
            } else if (ad > DENSITY_HIGH) {
                setSimilarPercent((old) => Math.max(0.01, 0.9 * old));
            }
        },
        [setSimilarPercent, scale]
    );

    return (
        <>
            <Graph
                onNodeDensity={autoEdges ? doNodeDensity : undefined}
                autoCamera={autoCamera}
                onZoom={(z: number) => {
                    currentZoom.current = z;
                }}
                links={links}
                nodes={nodes}
                linkScale={linkDistance}
                linkStyles={linkStyles}
                defaultLinkStyle={{
                    className: style.link,
                    opacity: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        theme.transparentLinks
                            ? egoSelect && linkStyles
                                ? 0
                                : l.source.data?.label && l.source.data?.label === l.target.data?.label
                                ? 0.5
                                : 0.1
                            : egoSelect && linkStyles
                            ? 0
                            : l.source.data?.label && l.source.data?.label === l.target.data?.label
                            ? 0.8
                            : 0.3,
                    width: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        MIN_LINE_THICKNESS + Math.floor(l.strength * LINE_THICKNESS_UNSELECTED),
                    colour: (l: InternalGraphLink<UserNodeId, UserNodeId>) =>
                        l.source.data?.colour === l.target.data?.colour
                            ? (l.source.data?.colour as string)
                            : theme.linkColour || '#5f7377',
                }}
                charge={nodeCharge}
                showLines={showLines}
                onSelect={(n: Readonly<GraphNode<UserNodeId>>, _, element, parent) => {
                    const rect = element.getClientRects()[0];
                    //setCenter([n.x || 0, n.y || 0]);
                    userElement.current = element;
                    const parentLeft = parent.getBoundingClientRect();
                    if (rect) {
                        setUserMenu([rect.x + rect.width / 2 - parentLeft.left, rect.y + rect.height + 20]);
                    } else {
                        setUserMenu([0, 0]);
                    }
                    setFocusNode(n.id);
                }}
                onUnselect={() => {
                    setFocusNode(undefined);
                    setConnected(undefined);
                    setLinkStyles(undefined);
                    userElement.current = undefined;
                    setUserMenu(undefined);
                }}
                onDragStop={() => {
                    if (userElement.current) {
                        const rect = userElement.current.getClientRects()[0];
                        const parent = userElement.current?.ownerSVGElement;
                        if (rect && parent) {
                            const parentLeft = parent.getBoundingClientRect();
                            setUserMenu([rect.x + rect.width / 2 - parentLeft.left, rect.y + rect.height + 20]);
                        } else {
                            setUserMenu([0, 0]);
                        }
                    }
                }}
                focusNode={focusNode}
                zoom={5}
                LabelComponent={showLabel ? UserLabel : undefined}
                injectStyle={
                    <style>{`.${style.cloudItem} rect {opacity: 0.2; fill: #078092;} .${style.cloudItem} text { fill: #444;}`}</style>
                }
                style={{ background: theme.background }}
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
                        density={density}
                        zoom={currentZoom.current}
                    />
                ))}
            </Graph>
            {userMenu && showNodeMenu && (
                <UserMenu
                    x={userMenu[0]}
                    y={userMenu[1]}
                />
            )}
        </>
    );
}
