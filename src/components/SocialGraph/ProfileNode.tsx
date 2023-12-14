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
import Label from './Label';
import { getUserProfile } from '@genaism/services/profiler/profiler';

function hexToRgb(hex: string) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result
        ? {
              r: parseInt(result[1], 16),
              g: parseInt(result[2], 16),
              b: parseInt(result[3], 16),
          }
        : null;
}

function isLight(colour: string): boolean {
    const col = hexToRgb(colour);
    if (!col) return true;
    const Y = 0.2126 * col.r + 0.7152 * col.g + 0.0722 * col.b;
    return Y >= 128;
}

interface Props {
    id: UserNodeId;
    live?: boolean;
    selected?: boolean;
    disabled?: boolean;
    colourMapping?: Map<string, string>;
    onLinks: (id: string, links: GraphLink<UserNodeId, UserNodeId>[]) => void;
    onResize: (id: string, size: number) => void;
}

const colours = [
    '#2e6df5',
    '#19b1a8',
    '#fad630',
    '#fd9d32',
    '#e04f66',
    '#a77bca',
    '#c2a251',
    '#97999b',
    '#8bbee8',
    '#a2e4b8',
    '#fecb8b',
    '#ff9499',
];

export default function ProfileNode({ id, onLinks, onResize, live, selected, colourMapping, disabled }: Props) {
    const [size, setSize] = useState(100);
    const [colour, setColour] = useState('white');
    const simRef = useRef<WeightedNode<UserNodeId>[]>();
    const showLabel = useRecoilValue(settingDisplayLabel);
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);
    const similarPercent = useRecoilValue(settingSimilarPercent);

    const profile = useUserProfile(id);
    const similar = useSimilarUsers(profile);

    useEffect(() => {
        if (colourMapping) {
            let bestTopic = 'NOTOPIC';
            let bestTopicScore = 0;
            const maxWeight = similar[0]?.weight || 0;

            profile.taste.forEach((topic) => {
                let topicScore = 0;
                let userCount = 0;
                similar.forEach((user) => {
                    if (user.weight >= maxWeight * (1 - similarPercent)) {
                        const userProfile = getUserProfile(user.id);
                        const match = userProfile.taste.find((v) => v.label === topic.label);
                        if (match) {
                            topicScore += match.weight * topic.weight * user.weight * user.weight;
                        }
                        ++userCount;
                    }
                });

                topicScore /= userCount;

                if (userCount > 0 && topicScore > bestTopicScore) {
                    bestTopicScore = topicScore;
                    bestTopic = topic.label;
                }
            });

            if (!colourMapping.has(bestTopic)) {
                colourMapping.set(bestTopic, colours[colourMapping.size % colours.length]);
            }
            setColour(colourMapping.get(bestTopic) || 'white');
        } else {
            setColour('white');
        }
    }, [profile, colourMapping, similar, similarPercent]);

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
                .map((s) => ({
                    source: id,
                    target: s.id,
                    strength: s.weight,
                }))
        );
        //}
    }, [similar, onLinks, similarPercent]);

    const reduced = shrinkOffline && !live;
    const asize = reduced ? size * 0.4 : size;

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? asize + 20 : asize}
            />
            {showLabel && (
                <Label
                    label={profile.name}
                    x={0}
                    y={-asize - 20}
                    fill={live ? '#0A869A' : '#707070'}
                    color="white"
                    padding={5}
                />
            )}
            <circle
                data-testid="profile-circle"
                r={asize}
                fill={colour}
                stroke={live ? '#0A869A' : '#707070'}
                strokeWidth={reduced ? 5 : 10}
            />
            {!reduced && nodeMode === 'image' && profile.engagedContent.length > 0 && (
                <ImageCloud
                    content={profile.engagedContent}
                    size={300}
                    padding={3}
                    onSize={doResize}
                    className={disabled ? style.disabledImageCloud : undefined}
                />
            )}
            {!reduced && nodeMode === 'word' && (
                <WordCloud
                    content={profile.taste}
                    size={500}
                    padding={3}
                    className={!isLight(colour) ? style.cloudItemLight : style.cloudItem}
                    onSize={doResize}
                />
            )}
            {!reduced && nodeMode === 'score' && (
                <Label
                    label={profile.engagement.toFixed()}
                    x={0}
                    y={5}
                    fontSize={Math.floor(50 + profile.engagement * 10)}
                    color={isLight(colour) ? 'black' : 'white'}
                    fill={colour}
                    padding={0}
                    onResize={doResize}
                />
            )}
        </g>
    );
}
