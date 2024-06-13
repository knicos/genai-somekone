import { memo } from 'react';
import { ContentNodeId, UserNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { GraphNode } from '../Graph/types';
import { getContentData } from '@genaism/services/content/content';
import Label from '../SocialGraph/Label';

interface Props {
    id: UserNodeId | ContentNodeId;
    disabled?: boolean;
    onResize: (id: UserNodeId | ContentNodeId, size: number) => void;
    node: GraphNode<UserNodeId | ContentNodeId>;
    fixedSize?: boolean;
}

const ProfileNode = memo(function ProfileNode({ disabled, node }: Props) {
    const asize = node.size;

    const image = (node.data?.image as string) || '';
    const name = node.data?.name as string | undefined;

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            <circle
                className={style.outerCircle}
                data-testid="profile-selected"
                r={asize}
            />
            <circle
                data-nodeitem
                data-testid="profile-circle"
                r={asize}
                fill={(node.data?.colour as string) || '#5f7377'}
                stroke={(node.data?.colour as string) || '#5f7377'}
                strokeWidth={15}
            />
            {image.length > 0 && (
                <image
                    x={-asize}
                    y={-asize}
                    width={asize * 2}
                    height={asize * 2}
                    href={getContentData(image as ContentNodeId)}
                    preserveAspectRatio="none"
                    clipPath="circle() fill-box"
                />
            )}
            {name && (
                <Label
                    label={name}
                    x={0}
                    y={asize + 30}
                    scale={name.length < 20 ? 2.5 : 2}
                    padding={5}
                    fill={(node.data?.colour as string) || '#5f7377'}
                    color="white"
                />
            )}
        </g>
    );
});

export default ProfileNode;
