import { ContentNodeId, UserNodeId } from '@genaism/services/graph/graphTypes';
import Graph from '../Graph/Graph';
import { useSimilarUsers } from '@genaism/services/similarity/hooks';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { useEffect, useState } from 'react';
import { GraphLink, GraphNode, InternalGraphLink } from '../Graph/types';
import ProfileNode from './ProfileNode';
import colours from '../../style/colours.module.css';

const LINE_THICKNESS_UNSELECTED = 20;
const MIN_LINE_THICKNESS = 5;

interface Props {
    userId: UserNodeId;
    pairedId: UserNodeId;
    contentId: ContentNodeId;
}

export default function MiniUserGraph({ userId, pairedId, contentId }: Props) {
    const profile = useUserProfile(userId);
    const pairprofile = useUserProfile(pairedId);
    const similar = useSimilarUsers(profile);
    const [nodes, setNodes] = useState<GraphNode<UserNodeId | ContentNodeId>[]>([]);
    const [links, setLinks] = useState<GraphLink<UserNodeId | ContentNodeId, UserNodeId | ContentNodeId>[]>([]);

    useEffect(() => {
        const minS = similar.reduce((m, s) => Math.min(m, s.weight), 1);
        const maxS = similar.reduce((m, s) => Math.max(m, s.weight), 0);
        const dS = maxS - minS;

        const minC = pairprofile.affinities.contents.contents.reduce((m, s) => Math.min(m, s.weight), 1);
        const maxC = pairprofile.affinities.contents.contents.reduce((m, s) => Math.max(m, s.weight), 0);
        const dC = maxC - minC;

        console.log('PAIR PROFILE', contentId, pairprofile);

        const newNodes = [
            ...similar
                .filter((u) => u.id !== pairedId)
                .map((u) => {
                    return {
                        id: u.id,
                        size: 30,
                        data: {
                            colour: colours.backgroundDark,
                        },
                    };
                }),
            ...pairprofile.affinities.contents.contents
                .filter((u) => u.id !== contentId)
                .map((u) => {
                    return {
                        id: u.id,
                        size: 40,
                        data: {
                            image: u.id,
                            colour: colours.primary,
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
                id: pairedId,
                size: 30,
                fx: -50,
                fy: 0,
                data: { name: pairprofile.name, colour: colours.secondary },
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
            ...similar.map((u) => {
                return { source: userId, target: u.id, strength: (u.weight - minS) / dS, actualStrength: u.weight };
            }),
            ...pairprofile.affinities.contents.contents.map((c) => ({
                source: pairedId,
                target: c.id,
                strength: (c.weight - minC) / dC,
                actualStrength: c.weight,
            })),
        ];
        setLinks(newLinks);
    }, [similar, profile, userId, pairedId, pairprofile, contentId]);

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
