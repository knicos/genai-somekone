import { memo } from 'react';
import style from './style.module.css';
import { GraphNode } from '../Graph/types';
import Label from '../SocialGraph/Label';
import { ContentNodeId, isTopicID, TopicNodeId, UserNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

const BORDER_SIZE = 5;

interface Props {
    id: UserNodeId | ContentNodeId | TopicNodeId;
    disabled?: boolean;
    onResize: (id: UserNodeId | ContentNodeId | TopicNodeId, size: number) => void;
    node: GraphNode<UserNodeId | ContentNodeId | TopicNodeId>;
    fixedSize?: boolean;
}

const TopicNode = memo(function TopicNode({ disabled, node, id, onResize }: Props) {
    const content = useContentService();
    const asize = node.size;

    const image = (node.data?.image as string) || '';
    const name = node.data?.name as string | undefined;

    return (
        <g className={disabled ? style.disabledGroup : style.group}>
            {!isTopicID(id) && (
                <circle
                    data-nodeitem
                    data-testid="profile-circle"
                    r={asize}
                    fill={image.length > 0 ? 'white' : (node.data?.colour as string) || '#5f7377'}
                    stroke={(node.data?.colour as string) || '#5f7377'}
                    strokeWidth={BORDER_SIZE}
                />
            )}
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
            {isTopicID(id) && (
                <Label
                    label={(node.data?.label as string | undefined) || 'NoLabel'}
                    x={0}
                    y={0}
                    scale={2.5}
                    padding={5}
                    fill={(node.data?.colour as string) || '#5f7377'}
                    color="white"
                    onResize={(size) => onResize(id, Math.ceil(size))}
                />
            )}
        </g>
    );
});

export default TopicNode;
