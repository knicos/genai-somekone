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
    settingIncludeAllLinks,
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
import { colourLabel } from './colourise';
import { getUserName } from '@genaism/services/profiler/profiler';

const LINE_THICKNESS_UNSELECTED = 40;
const LINE_THICKNESS_SELECTED = 60;

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
    const allLinks = useRecoilValue(settingIncludeAllLinks);
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);
    const [focusNode, setFocusNode] = useRecoilState(menuSelectedUser);
    const [center, setCenter] = useState<[number, number] | undefined>();
    const [linkStyles, setLinkStyles] = useState<Map<UserNodeId, LinkStyle<UserNodeId>>>();
    const [connected, setConnected] = useState<Set<UserNodeId>>();
    const similarPercent = useRecoilValue(settingSimilarPercent);
    const similar = useAllSimilarUsers(
        users,
        clusterColouring > 0,
        clusterColouring > 0 ? clusterColouring : undefined
    );

    useEffect(() => {
        const newLinks: GraphLink<UserNodeId, UserNodeId>[] = [];
        let globalMin = 1;
        similar.similar.forEach((s) => {
            globalMin = Math.min(globalMin, s[0]?.weight || 1);
        });
        globalMin = globalMin * (1 - similarPercent);
        console.log(similar);
        similar.similar.forEach((s, id) => {
            const maxWeight = s[0]?.weight || 0;
            s.forEach((node) => {
                if (allLinks || node.weight >= maxWeight * (1 - similarPercent)) {
                    const astrength = Math.max(0, (node.weight - globalMin) / (1 - globalMin));
                    newLinks.push({
                        source: id,
                        target: node.id,
                        strength: node.weight >= maxWeight * (1 - similarPercent) ? astrength : 0,
                        actualStrength: astrength,
                    });
                }
            });
        });
        setLinks(newLinks);
    }, [similar, similarPercent, allLinks]);

    const doRedrawNodes = useCallback(() => {
        setNodes((oldNodes) => {
            const filteredUsers = showOfflineUsers
                ? users.filter((u) => u !== getCurrentUser())
                : users.filter((u) => liveSet.has(u) && u !== getCurrentUser());

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
                    return {
                        id: u,
                        label: getUserName(u),
                        size: newSize,
                        strength: similar.similar.get(u)?.length || 0,
                        data: {
                            topics: topicData || [],
                            colour: newColour,
                        },
                    };
                }
            });
            return newNodes;
        });
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
                        1 + Math.floor(l.strength * LINE_THICKNESS_UNSELECTED),
                }}
                charge={charge}
                showLines={showLines}
                onSelect={(n: Readonly<GraphNode<UserNodeId>>) => {
                    setCenter([n.x || 0, n.y || 0]);

                    setFocusNode(n.id);
                }}
                onUnselect={() => {
                    setFocusNode(undefined);
                    setConnected(undefined);
                    setLinkStyles(undefined);
                }}
                focusNode={focusNode}
                zoom={5}
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
