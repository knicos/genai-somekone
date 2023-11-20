import { useEffect, useRef } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { useSimilarUsers } from '@genaism/services/users/users';
import { GraphLink } from '../Graph/Graph';
import { WeightedNode } from '@genaism/services/graph/graphTypes';

interface Props {
    id: string;
    onLinks: (id: string, links: GraphLink[]) => void;
}

export default function FakeNode({ id, onLinks }: Props) {
    const simRef = useRef<WeightedNode[]>();

    const profile = useUserProfile(id);
    const similar = useSimilarUsers(profile);

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
        <circle
            r="5"
            fill="#444"
        />
    );
}
