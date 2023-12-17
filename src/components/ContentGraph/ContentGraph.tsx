import { useNodeType } from '@genaism/services/graph/hooks';
import { useCallback, useEffect, useRef, useState } from 'react';
import Graph, { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '../Graph/Graph';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import ContentNode from './ContentNode';
import { useAllCoengagements } from './similarity';
import {
    settingContentDisplayLines,
    settingContentLinkDistanceScale,
    settingContentNodeCharge,
    settingContentSimilarPercent,
} from '@genaism/state/settingsState';
import { useRecoilValue } from 'recoil';
import style from './style.module.css';

const MIN_WEIGHT = 0.02;

export default function ContentGraph() {
    const [links, setLinks] = useState<GraphLink<ContentNodeId, ContentNodeId>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const [nodes, setNodes] = useState<GraphNode<ContentNodeId>[]>([]);
    const linkScale = useRecoilValue(settingContentLinkDistanceScale);
    const showLines = useRecoilValue(settingContentDisplayLines);
    const charge = useRecoilValue(settingContentNodeCharge);
    const simPercent = useRecoilValue(settingContentSimilarPercent);
    const content = useNodeType('content');

    const similar = useAllCoengagements(content);

    const [focusNode, setFocusNode] = useState<string | undefined>();
    const [zoom, setZoom] = useState(1);
    const [center, setCenter] = useState<[number, number] | undefined>();
    const [linkStyles, setLinkStyles] = useState<Map<ContentNodeId, LinkStyle<ContentNodeId>>>();
    const [connected, setConnected] = useState<Set<ContentNodeId>>();

    const doRedrawNodes = useCallback(() => {
        const filteredTopics = content.filter((t) => {
            const s = similar.similar.get(t);
            return (s?.maxSimilarity || 0) > MIN_WEIGHT;
        });

        const newNodes = filteredTopics.map((u) => ({
            id: u,
            size: sizesRef.current.get(u) || 20,
        }));

        setNodes(newNodes);
        // Create some links
        const links: GraphLink<ContentNodeId, ContentNodeId>[] = [];

        filteredTopics.forEach((source) => {
            const similarNodes = similar.similar.get(source);
            if (similarNodes) {
                const maxWeight = similarNodes.maxSimilarity;
                if (maxWeight <= MIN_WEIGHT) return;

                const maxNeighbours = similarNodes.nodes.reduce(
                    (m, n) => Math.max(m, similar.similar.get(n.id)?.maxSimilarity || 0),
                    0
                );
                const maxmax = Math.max(maxNeighbours, maxWeight);

                similarNodes.nodes.forEach((target) => {
                    if (target.weight > (1 - simPercent) * maxWeight && source !== target.id) {
                        links.push({ source, target: target.id, strength: target.weight / maxmax });
                    }
                });
            }
        });

        setLinks(links);
    }, [content, similar, simPercent]);

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
            charge={charge}
            showLines={showLines}
            onSelect={(n: Readonly<GraphNode<ContentNodeId>>, l: InternalGraphLink<ContentNodeId, ContentNodeId>[]) => {
                if (!focusNode) setZoom(0.5);
                const newStyles = new Map<ContentNodeId, LinkStyle<ContentNodeId>>();
                newStyles.set(n.id, {
                    className: style.selectedLink,
                    width: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) =>
                        1 + Math.floor(l.strength * l.strength * 60),
                });

                const conn = new Set<ContentNodeId>();
                conn.add(n.id);
                l.forEach((link) => {
                    conn.add(link.source.id);
                    conn.add(link.target.id);
                });

                setConnected(conn);
                setLinkStyles(newStyles);
                setCenter([n.x || 0, n.y || 0]);
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
            defaultLinkStyle={{
                className: style.link,
                opacity: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) => (linkStyles ? 0 : l.strength * 0.9),
                width: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) => 1 + Math.floor(l.strength * 60),
            }}
        >
            {nodes.map((n) => (
                <ContentNode
                    id={n.id}
                    key={n.id}
                    selected={n.id === focusNode}
                    onResize={doResize}
                    disabled={connected ? !connected.has(n.id) : false}
                />
            ))}
        </Graph>
    );
}
