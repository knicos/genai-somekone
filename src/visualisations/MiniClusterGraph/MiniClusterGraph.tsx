import Graph from '../Graph/Graph';
import { useEffect, useState } from 'react';
import { GraphLink, GraphNode, InternalGraphLink } from '../Graph/types';
import ProfileNode from './ProfileNode';
import colours from '@knicos/genai-base/css/colours.module.css';
import { ContentNodeId, UserNodeId, WeightedNode } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useSimilarityData } from '@genaism/hooks/similarity';
import { colourLabel } from '../SocialGraph/colourise';
import { generateLinks } from '../SocialGraph/links';

const LINE_THICKNESS_UNSELECTED = 20;
const MIN_LINE_THICKNESS = 5;

interface Props {
    userId: UserNodeId;
}

export default function MiniClusterGraph({ userId }: Props) {
    const profile = useUserProfile(userId);
    const similar = useSimilarityData();
    const [nodes, setNodes] = useState<GraphNode<UserNodeId | ContentNodeId>[]>([]);
    const [links, setLinks] = useState<GraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>[]>([]);

    const cluster = similar.clusters.get(userId)?.label || 'none';

    useEffect(() => {
        const mySimilar = similar.similar.get(userId);
        if (!mySimilar) return;
        const similarUsers = mySimilar.filter((u) => {
            const c = similar.clusters.get(u.id);
            return c?.label === cluster;
        });
        if (!similarUsers) return;
        const newNodes = [
            ...similarUsers.map((u) => {
                return {
                    id: u.id,
                    size: 50,
                    data: {
                        colour: colourLabel(cluster),
                    },
                };
            }),
            {
                id: userId,
                size: 50,
                //fx: 0,
                //fy: 0,
                data: { name: profile.name, colour: colourLabel(cluster) },
            },
        ];
        setNodes(newNodes);

        const similarSubset = new Map<UserNodeId, WeightedNode<UserNodeId>[]>();
        similarSubset.set(userId, mySimilar);
        similarUsers.forEach((u) => {
            const s = similar.similar.get(u.id);
            if (s) {
                similarSubset.set(u.id, s);
            }
        });

        const newLinks = generateLinks(similarSubset, false, 0.3, 4);
        setLinks(newLinks);
    }, [similar, profile, userId, cluster]);

    return (
        <Graph
            links={links}
            nodes={nodes}
            linkScale={1.2}
            defaultLinkStyle={{
                opacity: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    l.target.fx !== undefined ? 0.6 : 0.1,
                width: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    MIN_LINE_THICKNESS + Math.floor(l.strength * LINE_THICKNESS_UNSELECTED),
                colour: (l: InternalGraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>) =>
                    l.target.fx !== undefined ? colours.secondary : '#444',
            }}
            charge={0.5}
            showLines={true}
            zoom={0.8}
            center={[0, 0]}
            disableControls={true}
            disableCenter={false}
            autoCamera
        >
            {nodes.map((n) => (
                <ProfileNode
                    id={n.id}
                    node={n}
                    onResize={() => {}}
                    key={n.id}
                />
            ))}
        </Graph>
    );
}
