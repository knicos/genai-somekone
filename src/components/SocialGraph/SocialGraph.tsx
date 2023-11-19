import { useNodeType } from '@genaism/services/graph/hooks';
import { useMemo } from 'react';
import ProfileNode from '../ProfileNode/ProfileNode';
import Graph from '../Graph/Graph';

interface Props {
    liveUsers?: string[];
}

export default function SocialGraph({ liveUsers }: Props) {
    const users = useNodeType('user');
    const liveSet = useMemo(() => {
        const set = new Set<string>();
        liveUsers?.forEach((x) => {
            set.add(x);
        });
        return set;
    }, [liveUsers]);

    return (
        <Graph
            nodes={users.map((u) => ({
                id: u,
                size: 100,
                component: liveSet.has(u) ? (
                    <ProfileNode id={u} />
                ) : (
                    <circle
                        r="20"
                        fill="black"
                    />
                ),
            }))}
        />
    );
}
