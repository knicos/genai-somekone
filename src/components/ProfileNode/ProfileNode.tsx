import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { useSimilarUsers } from '@genaism/services/users/users';
import { GraphLink } from '../Graph/Graph';
import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecoilValue } from 'recoil';
import { settingDisplayLabel, settingNodeMode, settingShrinkOfflineUsers } from '@genaism/state/settingsState';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';

interface Props {
    id: string;
    live?: boolean;
    selected?: boolean;
    onLinks: (id: string, links: GraphLink[]) => void;
    onResize: (id: string, size: number) => void;
}

export default function ProfileNode({ id, onLinks, onResize, live, selected }: Props) {
    const [size, setSize] = useState(100);
    const simRef = useRef<WeightedNode[]>();
    const showLabel = useRecoilValue(settingDisplayLabel);
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);

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
            const maxWeight = similar[0]?.weight || 0;
            onLinks(
                id,
                similar
                    .filter((s) => s.weight >= maxWeight * 0.8)
                    .map((s) => ({ source: id, target: s.id, strength: s.weight }))
            );
        }
    }, [similar, onLinks]);

    return (
        <g className={style.group}>
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? size + 20 : size}
            />
            <circle
                data-testid="profile-circle"
                r={size}
                fill="white"
                stroke={live ? '#0A869A' : '#707070'}
                strokeWidth={shrinkOffline && !live ? 5 : 10}
            />
            {nodeMode === 'image' && profile.engagedContent.length > 0 && (
                <ImageCloud
                    content={profile.engagedContent}
                    size={shrinkOffline && !live ? 100 : 300}
                    padding={3}
                    onSize={doResize}
                />
            )}
            {nodeMode === 'word' && (
                <WordCloud
                    content={profile.taste}
                    size={shrinkOffline && !live ? 100 : 500}
                    padding={3}
                    colour={live ? '#0A869A' : '#707070'}
                    onSize={doResize}
                />
            )}
            {showLabel && (
                <text
                    y={-size - 5}
                    textAnchor="middle"
                >
                    {profile.name}
                </text>
            )}
        </g>
    );
}
