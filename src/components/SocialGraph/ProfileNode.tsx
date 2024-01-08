import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useState } from 'react';
import { useUserProfile } from '@genaism/services/profiler/hooks';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { useRecoilValue } from 'recoil';
import {
    //settingDisplayLabel,
    settingNodeMode,
    settingShrinkOfflineUsers,
} from '@genaism/state/settingsState';
import WordCloud from '../WordCloud/WordCloud';
import style from './style.module.css';
import Label from './Label';
import { GraphNode } from '../Graph/types';

interface Props {
    id: UserNodeId;
    live?: boolean;
    selected?: boolean;
    disabled?: boolean;
    onResize: (id: UserNodeId, size: number) => void;
    node: GraphNode<UserNodeId>;
}

export default function ProfileNode({ id, onResize, live, selected, disabled, node }: Props) {
    const [size, setSize] = useState(100);
    const shrinkOffline = useRecoilValue(settingShrinkOfflineUsers);
    const nodeMode = useRecoilValue(settingNodeMode);

    const profile = useUserProfile(id);

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
                stroke={(node.data?.colour as string) || '#707070'}
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
