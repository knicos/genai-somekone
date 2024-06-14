import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { GraphNode } from '../Graph/types';
import Label from './Label';
import { getUserData } from '@genaism/services/users/users';

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
    node: GraphNode<UserNodeId>;
    scale: number;
}

export default function UserLabel({ node, scale }: Props) {
    const name = getUserData(node.id)?.name;
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
