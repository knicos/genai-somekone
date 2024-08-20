import { UserNodeId } from '@knicos/genai-recom';
import { GraphNode } from '../Graph/types';
import Label from './Label';
import { isLight } from '@genaism/util/colours';
import { useRecoilValue } from 'recoil';
import { settingSocialGraphTheme } from '@genaism/state/settingsState';
import graphThemes from './graphTheme';

interface Props {
    node: GraphNode<UserNodeId>;
    scale: number;
}

export default function UserLabel({ node, scale }: Props) {
    const themeName = useRecoilValue(settingSocialGraphTheme);
    const maxLength = 5 + Math.floor(20 / scale);
    const name = node.label || 'None';
    const shortName = name.length >= maxLength ? `${name.slice(0, maxLength)}...` : name;
    const theme = graphThemes[themeName];
    const colour = theme.labelColour || (node.data?.colour as string) || '#5f7377';
    if (!name) return null;

    return (
        <Label
            label={shortName}
            x={node.x || 0}
            y={(node.y || 0) + node.size + 10}
            fill={colour || '#5f7377'}
            color={isLight(colour || '#5f7377') ? 'black' : 'white'}
            padding={5}
            scale={Math.max(1, Math.min(scale, 4))}
        />
    );
}
