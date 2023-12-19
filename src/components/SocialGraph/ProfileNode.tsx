import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useEffect, useState } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useRecoilValue } from 'recoil';
import {
    //settingDisplayLabel,
    settingNodeMode,
    settingShrinkOfflineUsers,
    settingSimilarPercent,
} from '@genaism/state/settingsState';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';
import Label from './Label';
import { getUserProfile } from '@genaism/services/profiler/profiler';
import { GraphNode } from '../Graph/types';

interface Props {
    id: UserNodeId;
    live?: boolean;
    selected?: boolean;
    disabled?: boolean;
    colourMapping?: Map<string, string>;
    similarUsers: WeightedNode<UserNodeId>[];
    onResize: (id: string, size: number) => void;
    node: GraphNode<UserNodeId>;
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

export default function ProfileNode({
    id,
    onResize,
    live,
    selected,
    colourMapping,
    disabled,
    similarUsers,
    node,
}: Props) {
    const [size, setSize] = useState(100);
    const [colour, setColour] = useState('#707070');
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);
    const similarPercent = useRecoilValue(settingSimilarPercent);

    const profile = useUserProfile(id);

    useEffect(() => {
        if (colourMapping) {
            let bestTopic = 'NOTOPIC';
            let bestTopicScore = 0;
            const maxWeight = similarUsers[0]?.weight || 0;

            profile.taste.forEach((topic) => {
                let topicScore = 0;
                let userCount = 0;
                similarUsers.forEach((user) => {
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
            setColour(colourMapping.get(bestTopic) || '#707070');
        } else {
            setColour('#707070');
        }
    }, [profile, colourMapping, similarUsers, similarPercent]);

    if (!node.data) node.data = {};
    node.data.colour = colour;

    const doResize = useCallback(
        (s: number) => {
            setSize(s + 20);
            onResize(id, s + 20);
        },
        [onResize, id]
    );

    const reduced = shrinkOffline && !live;
    const asize = reduced ? size * 0.4 : size;

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? asize + 20 : asize}
            />
            <circle
                data-testid="profile-circle"
                r={asize}
                fill={'white'}
                stroke={colour}
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
                    className={style.cloudItem}
                    onSize={doResize}
                />
            )}
            {!reduced && nodeMode === 'score' && (
                <Label
                    label={profile.engagement.toFixed()}
                    x={0}
                    y={5}
                    fontSize={Math.floor(50 + profile.engagement * 10)}
                    color={'#707070'}
                    fill={'white'}
                    padding={0}
                    onResize={doResize}
                />
            )}
        </g>
    );
}
