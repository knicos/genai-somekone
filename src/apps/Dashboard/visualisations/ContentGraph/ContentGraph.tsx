import { useCallback, useEffect, useState } from 'react';
import Graph from '@genaism/common/visualisations/Graph/Graph';
import { GraphLink, GraphNode, InternalGraphLink, LinkStyle } from '@genaism/common/visualisations/Graph/types';
import ContentNode from './ContentNode';
import { useAllCoengagements } from './similarity';
import {
    settingContentDisplayLines,
    settingContentLinkDistanceScale,
    settingContentNodeCharge,
    settingContentSimilarPercent,
} from '@genaism/apps/Dashboard/state/settingsState';
import { useRecoilValue } from 'recoil';
import style from './style.module.css';
import { ContentNodeId, GraphService } from '@knicos/genai-recom';
import { useNodeType } from '@genaism/hooks/graph';
import { useContentService, useGraphService } from '@genaism/hooks/services';

const MIN_WEIGHT = 0.02;
const MIN_SIZE = 50;
const MAX_SIZE = 400;
const SIZE_SCALE = 200;

function calculateNodeSize(graph: GraphService, id: ContentNodeId) {
    const engage = graph.getRelated('engaged', id, { count: 10, timeDecay: 0.1, period: 60 * 60 * 1000 });
    const sum = engage.reduce((s, v) => s + v.weight, 0);
    return Math.min(MAX_SIZE, sum * SIZE_SCALE) + MIN_SIZE;
}

export default function ContentGraph() {
    const [links, setLinks] = useState<GraphLink<ContentNodeId, ContentNodeId>[]>([]);
    const [nodes, setNodes] = useState<GraphNode<ContentNodeId>[]>([]);
    const linkScale = useRecoilValue(settingContentLinkDistanceScale);
    const showLines = useRecoilValue(settingContentDisplayLines);
    const charge = useRecoilValue(settingContentNodeCharge);
    const simPercent = useRecoilValue(settingContentSimilarPercent);
    const content = useNodeType('content');
    const contentService = useContentService();
    const graph = useGraphService();

    const similar = useAllCoengagements(content);

    const [focusNode, setFocusNode] = useState<string | undefined>();
    const [zoom, setZoom] = useState(5);
    const [center, setCenter] = useState<[number, number] | undefined>();
    const [linkStyles, setLinkStyles] = useState<Map<ContentNodeId, LinkStyle<ContentNodeId>>>();

    const doRedrawNodes = useCallback(() => {
        const filteredTopics = content.filter((t) => {
            const s = similar.similar.get(t);
            return (s?.maxSimilarity || 0) > MIN_WEIGHT;
        });

        filteredTopics.sort(
            (a, b) =>
                (contentService.getContentStats(b)?.engagement || 0) -
                (contentService.getContentStats(a)?.engagement || 0)
        );

        const newNodes = filteredTopics.slice(0, Math.max(20, Math.floor(0.4 * filteredTopics.length))).map((u) => ({
            id: u,
            label: u,
            size: calculateNodeSize(graph, u),
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
                        links.push({
                            source,
                            target: target.id,
                            strength: target.weight / maxmax,
                            actualStrength: target.weight / maxmax,
                        });
                    }
                });
            }
        });

        setLinks(links);
    }, [content, similar, simPercent, contentService, graph]);

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
            onSelect={(n: Readonly<GraphNode<ContentNodeId>>) => {
                if (!focusNode) setZoom(2);
                const newStyles = new Map<ContentNodeId, LinkStyle<ContentNodeId>>();
                newStyles.set(n.id, {
                    className: style.selectedLink,
                    width: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) =>
                        1 + Math.floor(l.strength * l.strength * 60),
                });
                setLinkStyles(newStyles);
                setCenter([n.x || 0, n.y || 0]);
                setFocusNode(n.id);
            }}
            onUnselect={() => {
                setFocusNode(undefined);
                setLinkStyles(undefined);
                setZoom(5);
            }}
            focusNode={focusNode}
            zoom={zoom}
            center={center}
            defaultLinkStyle={{
                className: style.link,
                opacity: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) => l.strength * 0.8 + 0.2,
                width: (l: InternalGraphLink<ContentNodeId, ContentNodeId>) => 5 + Math.floor(l.strength * 80),
            }}
        >
            {nodes.map((n) => (
                <ContentNode
                    id={n.id}
                    key={n.id}
                    size={n.size}
                    selected={n.id === focusNode}
                    disabled={false}
                />
            ))}
        </Graph>
    );
}
