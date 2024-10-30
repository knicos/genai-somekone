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
} from '@genaism/state/settingsState';
// import FakeNode from '../FakeNode/FakeNode';
import style from './style.module.css';
import { useAllSimilarUsers } from './similarity';
import UserLabel from './UserLabel';
import { menuSelectedUser } from '@genaism/state/menuState';
import { colourLabel } from './colourise';
import { UserNodeId } from '@knicos/genai-recom';
import { useNodeType } from '@genaism/hooks/graph';
import { Point } from '@knicos/genai-recom/utils/embeddings/mapping';
import { useProfilerService } from '@genaism/hooks/services';
import { calculateParameters } from './parameters';
import graphThemes from './graphTheme';
import UserMenu from './UserMenu';
import DebounceGraph from '../Graph/DebounceGraph';
import { generateLinks } from './links';

const DEBOUNCE = 1000;
const LINE_THICKNESS_UNSELECTED = 40;
const MIN_LINE_THICKNESS = 10;
const LINE_THICKNESS_SELECTED = 60;
const DENSITY_LOW = 0.01;
const DENSITY_HIGH = 0.03;

interface Props {
    liveUsers?: UserNodeId[];
}

export default function SocialGraphElement({ liveUsers }: Props) {
    const [links, setLinks] = useState<GraphLink<UserNodeId, UserNodeId>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const [nodes, setNodes] = useState<GraphNode<UserNodeId>[]>([]);
    const scale = useRecoilValue(settingSocialGraphScale);
    const showLines = useRecoilValue(settingDisplayLines);
    const showOfflineUsers = useRecoilValue(settingShowOfflineUsers);
    const clusterColouring = useRecoilValue(settingClusterColouring);
    const [similarPercent, setSimilarPercent] = useRecoilState(settingSimilarPercent);
    const linkLimit = useRecoilValue(settingLinkLimit);
    const egoSelect = useRecoilValue(settingEgoOnSelect);
    const showLabel = useRecoilValue(settingDisplayLabel);
    const allLinks = useRecoilValue(settingIncludeAllLinks);
    const themeName = useRecoilValue(settingSocialGraphTheme);
    const autoCamera = useRecoilValue(settingAutoCamera);
    const autoEdges = useRecoilValue(settingAutoEdges);
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);
    const [focusNode, setFocusNode] = useRecoilState(menuSelectedUser);
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();
    const similar = useAllSimilarUsers(
        users,
        clusterColouring > 0,
        clusterColouring > 0 ? clusterColouring : undefined
    );
    const pointMap = useRef(new Map<UserNodeId, Point>());
    const profiler = useProfilerService();
    const currentZoom = useRef(1);
    const [userMenu, setUserMenu] = useState<[number, number] | undefined>();
    const userElement = useRef<SVGElement>();

    const { nodeCharge, linkDistance, density } = calculateParameters(
        scale,
        window.innerWidth * window.innerHeight,
        nodes.length
    );

    const theme = graphThemes[themeName];

    useEffect(() => {
        const newLinks = generateLinks(similar.similar, allLinks, similarPercent, linkLimit);
        setLinks(newLinks);
    }, [similar, similarPercent, allLinks, linkLimit]);

    const doRedrawNodes = useCallback(async () => {
        setNodes((oldNodes) => {
            const filteredUsers = showOfflineUsers
                ? users.filter((u) => u !== profiler.getCurrentUser() && (similar.similar.get(u)?.length || 0) > 0)
                : users.filter((u) => liveSet.has(u) && u !== profiler.getCurrentUser());

            const oldMap = new Map<UserNodeId, GraphNode<UserNodeId>>();
            oldNodes.map((on) => oldMap.set(on.id, on));

            const newNodes = filteredUsers.map((u) => {
                const newSize = sizesRef.current.get(u) || 100;
                const topicData = similar.topics?.get(u);
                const newColour = topicData
                    ? colourLabel(topicData?.label || '')
                    : liveSet.has(u)
                    ? '#008297'
                    : '#5f7377';

                const old = oldMap.get(u);
                if (old && old.size === newSize && old.data?.colour === newColour) {
                    return old;
                } else {
                    const p = pointMap.current.get(u);
                    return {
                        id: u,
                        x: p ? p.x * 4000 - 2000 : undefined,
                        y: p ? p.y * 4000 - 2000 : undefined,
                        label: profiler.getUserName(u),
                        size: newSize,
                        strength: similar.similar.get(u)?.length || 0,
                        data: {
                            topics: topicData || [],
                            colour: newColour,
                            label: topicData?.label || false,
                        },
                    };
                }
            });

            return newNodes;
        });
    }, [users, liveSet, showOfflineUsers, similar, profiler]);

    const doResize = useCallback((id: string, size: number) => {
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
    }, []);

    useEffect(() => {
        doRedrawNodes();
    }, [doRedrawNodes]);

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
            <DebounceGraph
                onNodeDensity={autoEdges ? doNodeDensity : undefined}
                autoCamera={autoCamera}
                rateLimit={DEBOUNCE}
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
            </DebounceGraph>
            {userMenu && (
                <UserMenu
                    x={userMenu[0]}
                    y={userMenu[1]}
                />
            )}
        </>
    );
}
