import Graph from '../Graph/Graph';
import { useEffect, useState } from 'react';
import { GraphLink, GraphNode, InternalGraphLink } from '../Graph/types';
import colours from '@knicos/genai-base/css/colours.module.css';
import ContentNode from './ContentNode';
import { ContentNodeId, UserNodeId } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useGraphService } from '@genaism/hooks/services';

const LINE_THICKNESS_UNSELECTED = 20;
const MIN_LINE_THICKNESS = 5;

interface Props {
    userId: UserNodeId;
    originId: ContentNodeId;
    contentId: ContentNodeId;
}

export default function MiniCoengGraph({ userId, originId, contentId }: Props) {
    const profile = useUserProfile(userId);
    const [nodes, setNodes] = useState<GraphNode<UserNodeId | ContentNodeId>[]>([]);
    const [links, setLinks] = useState<GraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>[]>([]);
    const graph = useGraphService();

    useEffect(() => {
        const related = graph.getRelated('coengaged', originId, { count: 8 });
        const engageOrigin = graph.getEdgeWeights('engaged', userId, originId)[0] || 0;
        const engageCo = graph.getEdgeWeights('coengaged', originId, contentId)[0] || 0;

        const minS = related.reduce((m, s) => Math.min(m, s.weight), Math.min(engageOrigin, engageCo));
        const maxS = related.reduce((m, s) => Math.max(m, s.weight), Math.max(engageOrigin, engageCo));

        const dS = maxS - minS;

        const newNodes = [
            ...related
                .filter((u) => u.id !== contentId)
                .map((u) => {
                    return {
                        id: u.id,
                        size: 40,
                        data: {
                            colour: colours.backgroundDark,
                            image: u.id,
                        },
                    };
                }),
            {
                id: userId,
                size: 30,
                fx: -300,
                fy: -100,
                data: { name: profile.name, colour: colours.secondary },
            },
            {
                id: originId,
                size: 80,
                fx: -50,
                fy: 0,
                data: { image: originId, colour: colours.secondary },
            },
            {
                id: contentId,
                size: 80,
                fx: 220,
                fy: 100,
                data: { image: contentId, colour: colours.secondary },
            },
        ];
        setNodes(newNodes);

        const newLinks = [
            ...related
                .filter((u) => u.id !== contentId)
                .map((u) => {
                    return {
                        source: originId,
                        target: u.id,
                        strength: (u.weight - minS) / dS,
                        actualStrength: u.weight,
                    };
                }),
            {
                source: userId,
                target: originId,
                strength: (engageOrigin - minS) / dS,
                actualStrength: engageOrigin,
            },
            {
                source: originId,
                target: contentId,
                strength: (engageCo - minS) / dS,
                actualStrength: engageCo,
            },
        ];
        setLinks(newLinks);
    }, [originId, contentId, userId, profile, graph]);

    return (
        <Graph
            links={links}
            nodes={nodes}
            linkScale={1}
            defaultLinkStyle={{
                opacity: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    l.target.fx !== undefined ? 0.6 : 0.1,
                width: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    MIN_LINE_THICKNESS + Math.floor(l.strength * LINE_THICKNESS_UNSELECTED),
                colour: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    l.target.fx !== undefined ? colours.secondary : '#444',
            }}
            charge={0.3}
            showLines={true}
            zoom={1}
            center={[0, 0]}
            disableControls={true}
            disableCenter={true}
        >
            {nodes.map((n) => (
                <ContentNode
                    id={n.id}
                    node={n}
                    onResize={() => {}}
                    key={n.id}
                />
            ))}
        </Graph>
    );
}
