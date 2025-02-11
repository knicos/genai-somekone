import { UserNodeId } from '@knicos/genai-recom';
import { GraphNode } from '../../../../common/visualisations/Graph/types';
import { isLight } from '@genaism/util/colours';
import { useRecoilValue } from 'recoil';
import { settingSocialGraphTheme } from '@genaism/apps/Dashboard/state/settingsState';
import graphThemes from './graphTheme';
import { memo } from 'react';
import LabelContent from '@genaism/common/components/Label/LabelContent';

interface Props {
    node: GraphNode<UserNodeId>;
    scale: number;
}

const UserLabelContent = memo(function UserLabelContent({ node, scale }: Props) {
    const themeName = useRecoilValue(settingSocialGraphTheme);
    const maxLength = 5 + Math.floor(20 / scale);
    const name = node.label || 'None';
    const shortName = name.length >= maxLength ? `${name.slice(0, maxLength)}...` : name;
    const theme = graphThemes[themeName];
    const colour = theme.labelColour || (node.data?.colour as string) || '#5f7377';
    if (!name) return null;

    return (
        <LabelContent
            label={shortName}
            fill={colour || '#5f7377'}
            color={isLight(colour || '#5f7377') ? 'black' : 'white'}
            padding={5}
            scale={Math.max(1, Math.min(scale, 4))}
        />
    );
});

export default function UserLabel({ node, scale }: Props) {
    const size = node.original?.size || node.size;
    const x = node.x || 0;
    const y = (node.y || 0) + size + 10;

    return (
        <g transform={`translate(${Math.floor(x)}, ${Math.floor(y)})`}>
            <UserLabelContent
                node={node}
                scale={scale}
            />
        </g>
    );
}
