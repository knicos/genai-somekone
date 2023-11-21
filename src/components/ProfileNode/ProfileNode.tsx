import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { useSimilarUsers } from '@genaism/services/users/users';
import { GraphLink } from '../Graph/Graph';
import { WeightedNode } from '@genaism/services/graph/graphTypes';

interface Props {
    id: string;
    onLinks: (id: string, links: GraphLink[]) => void;
    onResize: (id: string, size: number) => void;
}

export default function ProfileNode({ id, onLinks, onResize }: Props) {
    const [size, setSize] = useState(100);
    const simRef = useRef<WeightedNode[]>();

    const profile = useUserProfile(id);
    const similar = useSimilarUsers(profile);

    const doResize = useCallback(
        (s: number) => {
            setSize(s + 20);
            onResize(id, s + 20);
        },
        [onResize, id]
    );

    useEffect(() => {
        if (simRef.current !== similar) {
            simRef.current = similar;
            onLinks(
                id,
                similar.map((s) => ({ source: id, target: s.id, strength: s.weight }))
            );
        }
    }, [similar, onLinks]);

    return (
        <>
            <circle
                r={size}
                fill="white"
                stroke="#0A869A"
                strokeWidth="10"
            />
            {profile.engagedContent.length && (
                <ImageCloud
                    content={profile.engagedContent}
                    size={300}
                    padding={3}
                    onSize={doResize}
                />
            )}
            <text
                y={-size - 5}
                textAnchor="middle"
            >
                {profile.name}
            </text>
        </>
    );
}
