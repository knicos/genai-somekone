import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { useSimilarUsers } from '@genaism/services/users/users';
import { GraphLink } from '../Graph/Graph';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecoilValue } from 'recoil';
import {
    settingDisplayLabel,
    settingNodeMode,
    settingShrinkOfflineUsers,
    settingSimilarPercent,
} from '@genaism/state/settingsState';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';

interface Props {
    id: UserNodeId;
    live?: boolean;
    selected?: boolean;
    onLinks: (id: string, links: GraphLink<UserNodeId, UserNodeId>[]) => void;
    onResize: (id: string, size: number) => void;
}

export default function ProfileNode({ id, onLinks, onResize, live, selected }: Props) {
    const [size, setSize] = useState(100);
    const simRef = useRef<WeightedNode<UserNodeId>[]>();
    const showLabel = useRecoilValue(settingDisplayLabel);
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);
    const similarPercent = useRecoilValue(settingSimilarPercent);

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
        //if (simRef.current !== similar) {
        simRef.current = similar;
        const maxWeight = similar[0]?.weight || 0;
        onLinks(
            id,
            similar
                .filter((s) => s.weight >= maxWeight * (1 - similarPercent))
                .map((s) => ({ source: id, target: s.id, strength: s.weight }))
        );
        //}
    }, [similar, onLinks, similarPercent]);

    const reduced = shrinkOffline && !live;
    const asize = reduced ? size * 0.4 : size;

    return (
        <g className={style.group}>
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? asize + 20 : asize}
            />
            <circle
                data-testid="profile-circle"
                r={asize}
                fill="white"
                stroke={live ? '#0A869A' : '#707070'}
                strokeWidth={reduced ? 5 : 10}
            />
            {!reduced && nodeMode === 'image' && profile.engagedContent.length > 0 && (
                <ImageCloud
                    content={profile.engagedContent}
                    size={300}
                    padding={3}
                    onSize={doResize}
                />
            )}
            {!reduced && nodeMode === 'word' && (
                <WordCloud
                    content={profile.taste}
                    size={500}
                    padding={3}
                    colour={live ? '#0A869A' : '#707070'}
                    onSize={doResize}
                />
            )}
            {showLabel && (
                <text
                    y={-asize - 5}
                    textAnchor="middle"
                >
                    {profile.name}
                </text>
            )}
        </g>
    );
}
