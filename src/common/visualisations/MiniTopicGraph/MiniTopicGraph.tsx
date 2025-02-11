import Graph from '../Graph/Graph';
import { useCallback, useEffect, useReducer, useRef, useState } from 'react';
import { GraphLink, GraphNode, InternalGraphLink } from '../Graph/types';
import TopicNode from './TopicNode';
import colours from '@knicos/genai-base/css/colours.module.css';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useServices } from '@genaism/hooks/services';
import { ContentNodeId, getTopicId, TopicNodeId, UserNodeId } from '@knicos/genai-recom';
import { localiser } from '@genaism/services/localiser/localiser';
import { useTranslation } from 'react-i18next';

const LINE_THICKNESS_UNSELECTED = 20;
const MIN_LINE_THICKNESS = 5;
const STRENGTH_PROPORTION = 0.1;

interface Props {
    userId: UserNodeId;
    topic: string;
    contentId: ContentNodeId;
}

type AnyNode = UserNodeId | TopicNodeId | ContentNodeId;

export default function MiniTopicGraph({ userId, topic, contentId }: Props) {
    const { i18n } = useTranslation();
    const profile = useUserProfile(userId);
    const [count, trigger] = useReducer((a) => a + 1, 0);
    const [nodes, setNodes] = useState<GraphNode<AnyNode>[]>([]);
    const [links, setLinks] = useState<GraphLink<AnyNode, AnyNode>[]>([]);
    const sizesRef = useRef<Map<string, number>>(new Map<string, number>());
    const { graph, content } = useServices();

    const doResize = useCallback((id: string, size: number) => {
        const current = sizesRef.current.get(id);
        sizesRef.current.set(id, size);
        if (current !== size) trigger();
    }, []);

    useEffect(() => {
        const topics = profile.affinities.topics.topics.slice(0, 5);
        const minS = topics.reduce((m, s) => Math.min(m, s.weight), 1000);
        const maxS = topics.reduce((m, s) => Math.max(m, s.weight), 0);
        const dS = maxS - minS;

        const related = graph.getRelated('content', getTopicId(graph, topic)).map((t) => ({
            id: t.id,
            weight: content.getContentStats(t.id)?.engagement || 0,
        }));
        related.sort((a, b) => b.weight - a.weight);
        related.splice(5);

        const minC = related.reduce((m, s) => Math.min(m, s.weight), 1);
        const maxC = related.reduce((m, s) => Math.max(m, s.weight), 0);
        const dC = maxC - minC;

        const newNodes = [
            ...topics
                .filter((u) => u.label !== topic)
                .map((u) => {
                    return {
                        id: `topic:${u.label}` as TopicNodeId,
                        size: sizesRef.current.get(`topic:${u.label}`) || 30,
                        data: {
                            colour: colours.backgroundDark,
                            label: `#${localiser.getLocalisedLabel(u.label, i18n.language)}`,
                        },
                    };
                }),
            ...related
                .filter((u) => u.id !== contentId)
                .map((u) => {
                    return {
                        id: u.id,
                        size: 30,
                        data: {
                            colour: colours.backgroundDark,
                            image: u.id,
                        },
                    };
                }),
            {
                id: userId,
                size: 30,
                fx: -180,
                fy: 100,
                data: { name: profile.name, colour: colours.secondary },
            },
            {
                id: `topic:${topic}` as TopicNodeId,
                size: sizesRef.current.get(`topic:${topic}`) || 30,
                fx: 20,
                fy: 0,
                data: { label: `#${localiser.getLocalisedLabel(topic, i18n.language)}`, colour: colours.secondary },
            },
            {
                id: contentId,
                size: 80,
                fx: 280,
                fy: -150,
                data: { image: contentId, colour: colours.secondary },
            },
        ];
        setNodes(newNodes);

        const newLinks = [
            ...topics
                .filter((u) => u.label !== topic)
                .map((u) => {
                    return {
                        source: userId,
                        target: `topic:${u.label}` as TopicNodeId,
                        strength: ((u.weight - minS) / dS) * STRENGTH_PROPORTION + (1 - STRENGTH_PROPORTION),
                        actualStrength: u.weight,
                    };
                }),
            {
                source: `topic:${topic}` as TopicNodeId,
                target: contentId,
                strength: 0.5,
                actualStrength: 0.5,
            },
            {
                target: `topic:${topic}` as TopicNodeId,
                source: userId,
                strength: 0.5,
                actualStrength: 0.5,
            },
            ...related
                .filter((u) => u.id !== contentId)
                .map((u) => {
                    return {
                        source: `topic:${topic}` as TopicNodeId,
                        target: u.id,
                        strength:
                            dC > 0 ? ((u.weight - minC) / dC) * STRENGTH_PROPORTION + (1 - STRENGTH_PROPORTION) : 0.5,
                        actualStrength: u.weight || 0.5,
                    };
                }),
        ];
        setLinks(newLinks);
    }, [profile, userId, contentId, topic, count, content, graph, i18n]);

    return (
        <Graph
            links={links}
            nodes={nodes}
            linkScale={10}
            defaultLinkStyle={{
                opacity: (l: InternalGraphLink<AnyNode, AnyNode>) => (l.target.fx !== undefined ? 0.6 : 0.1),
                width: (l: InternalGraphLink<AnyNode, AnyNode>) =>
                    MIN_LINE_THICKNESS + Math.floor(l.strength * LINE_THICKNESS_UNSELECTED),
                colour: (l: InternalGraphLink<AnyNode, AnyNode>) =>
                    l.target.fx !== undefined ? colours.secondary : '#444',
            }}
            charge={0.1}
            showLines={true}
            zoom={1}
            center={[0, 0]}
            disableControls={true}
            disableCenter={false}
        >
            {nodes.map((n) => (
                <TopicNode
                    id={n.id}
                    node={n}
                    onResize={doResize}
                    key={n.id}
                />
            ))}
        </Graph>
    );
}
