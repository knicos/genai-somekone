import { UserNodeId } from '@knicos/genai-recom';
import { GraphNode } from '../Graph/types';
import Label from './Label';
import { isLight } from '@genaism/util/colours';

interface Props {
    node: GraphNode<UserNodeId>;
    scale: number;
}

export default function UserLabel({ node, scale }: Props) {
    const name = node.label || 'None';
    const colour = node.data?.colour as string;
    if (!name) return null;
    return (
        <Label
            label={name}
            x={node.x || 0}
            y={(node.y || 0) - node.size - 10 - 15 * scale}
            fill={colour || '#5f7377'}
            color={isLight(colour || '#5f7377') ? 'black' : 'white'}
            padding={5}
            scale={scale}
        />
    );
}
