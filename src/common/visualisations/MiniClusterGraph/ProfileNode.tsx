import { memo, useState } from 'react';
import style from './style.module.css';
import { GraphNode } from '../Graph/types';
import Label from '../../components/Label/Label';
import { ContentNodeId, UserNodeId } from '@genai-fi/recom';
import { useServices } from '@genaism/hooks/services';

const BORDER_SIZE = 5;

interface Props {
    id: UserNodeId | ContentNodeId;
    disabled?: boolean;
    onResize: (id: UserNodeId | ContentNodeId, size: number) => void;
    node: GraphNode<UserNodeId | ContentNodeId>;
    fixedSize?: boolean;
}

const ProfileNode = memo(function ProfileNode({ disabled, node }: Props) {
    const { content, profiler } = useServices();
    const [hover, setHover] = useState(false);

    const asize = node.size;

    const profile = profiler.getUserData(node.id as UserNodeId);
    const image = profile?.image;

    const name = profile?.name;
    const alwaysLabel = node.data?.alwaysShowLabel as boolean | undefined;
    const showLabel = name && (alwaysLabel || hover);

    return (
        <g
            className={disabled ? style.disabledGroup : style.group}
            onPointerEnter={() => setHover(true)}
            onPointerLeave={() => setHover(false)}
            data-testid={node.id}
        >
            <circle
                data-nodeitem
                data-testid="profile-circle"
                r={asize}
                fill={image && image.length > 0 ? 'white' : (node.data?.colour as string) || '#5f7377'}
                stroke={(node.data?.colour as string) || '#5f7377'}
                strokeWidth={BORDER_SIZE}
            />
            {image && image.length > 0 && (
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
            {showLabel && (
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
