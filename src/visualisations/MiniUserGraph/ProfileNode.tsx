import { memo } from 'react';
import style from './style.module.css';
import { GraphNode } from '../Graph/types';
import Label from '../SocialGraph/Label';
import { ContentNodeId, UserNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

const BORDER_SIZE = 5;

interface Props {
    id: UserNodeId | ContentNodeId;
    disabled?: boolean;
    onResize: (id: UserNodeId | ContentNodeId, size: number) => void;
    node: GraphNode<UserNodeId | ContentNodeId>;
    fixedSize?: boolean;
}

const ProfileNode = memo(function ProfileNode({ disabled, node }: Props) {
    const content = useContentService();
    const asize = node.size;

    const image = (node.data?.image as string) || '';
    const name = node.data?.name as string | undefined;

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            <circle
                data-nodeitem
                data-testid="profile-circle"
                r={asize}
                fill={image.length > 0 ? 'white' : (node.data?.colour as string) || '#5f7377'}
                stroke={(node.data?.colour as string) || '#5f7377'}
                strokeWidth={BORDER_SIZE}
            />
            {image.length > 0 && (
                <image
                    x={-asize}
                    y={-asize}
                    width={asize * 2}
                    height={asize * 2}
                    href={content.getContentData(image as ContentNodeId, true)}
                    preserveAspectRatio="none"
                    clipPath={`circle(${asize - BORDER_SIZE}px)`}
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
