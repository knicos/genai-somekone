import ImageCloud from '../ImageCloud/ImageCloud';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { useRecoilValue } from 'recoil';
import {
    //settingDisplayLabel,
    settingNodeMode,
    settingShrinkOfflineUsers,
    settingTopicThreshold,
} from '@genaism/state/settingsState';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';
import Label from './Label';
import { GraphNode } from '../Graph/types';
import { ContentNodeId, UserNodeId, WeightedLabel } from '@knicos/genai-recom';
import { useUserProfile } from '@genaism/hooks/profiler';
import { useContentService } from '@genaism/hooks/services';

interface Props {
    id: UserNodeId;
    live?: boolean;
    selected?: boolean;
    disabled?: boolean;
    onResize: (id: UserNodeId, size: number) => void;
    node: GraphNode<UserNodeId>;
    fixedSize?: boolean;
}

function filterTaste(taste: WeightedLabel[], threshold: number): WeightedLabel[] {
    if (taste.length === 0) return taste;
    const max = taste[0].weight;
    return taste.filter((t) => t.weight >= threshold * max);
}

const ProfileNode = memo(function ProfileNode({ id, onResize, live, selected, disabled, node, fixedSize }: Props) {
    const [size, setSize] = useState(100);
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);
    const topicThreshold = useRecoilValue(settingTopicThreshold);
    const content = useContentService();

    const profile = useUserProfile(id);

    const doResize = useCallback(
        (s: number) => {
            if (!fixedSize) {
                setSize(s + 20);
                onResize(id, s + 20);
            }
        },
        [onResize, id, fixedSize]
    );

    const reduced = shrinkOffline && !live;
    const asize = reduced ? size * 0.4 : size;
    const image = profile.image;

    const ftaste = useMemo(() => {
        /*if (node.data?.topics) {
            return filterTaste(node.data.topics as WeightedLabel[], topicThreshold);
        } else {
            return [];
        }*/
        if (profile?.affinities.topics.topics) {
            return filterTaste(
                profile.affinities.topics.topics, // .filter((t) => !isDisallowedTopic(t.label)),
                topicThreshold
            );
        } else {
            return [];
        }
    }, [profile, topicThreshold]);

    useEffect(() => {
        if (nodeMode === 'profileImage') {
            doResize(Math.floor(profile.engagement * 2) + 50);
        }
    }, [doResize, nodeMode, profile]);

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            <circle
                className={selected ? style.selectedCircle : style.outerCircle}
                data-testid="profile-selected"
                r={selected ? asize + 20 : asize}
            />
            <circle
                data-nodeitem
                data-testid="profile-circle"
                r={asize}
                fill={'white'}
                stroke={(node.data?.colour as string) || '#5f7377'}
                strokeWidth={reduced ? 5 : 15}
            />
            {!reduced && nodeMode === 'image' && profile.affinities.contents.contents.length > 0 && (
                <ImageCloud
                    content={profile.affinities.contents.contents}
                    size={300}
                    padding={3}
                    onSize={doResize}
                    className={disabled ? style.disabledImageCloud : undefined}
                />
            )}
            {!reduced && nodeMode === 'word' && (
                <WordCloud
                    content={ftaste}
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
                    color={'#5f7377'}
                    fill={'white'}
                    padding={0}
                    onResize={doResize}
                />
            )}
            {!reduced && nodeMode === 'profileImage' && image && (
                <image
                    x={-asize}
                    y={-asize}
                    width={asize * 2}
                    height={asize * 2}
                    href={content.getContentData(image as ContentNodeId)}
                    preserveAspectRatio="none"
                    clipPath={`circle(${Math.floor(asize - 15)}px)`}
                />
            )}
        </g>
    );
});

export default ProfileNode;
