import type { Meta, StoryObj } from '@storybook/react';

import Graph from './Graph';
import { GraphNode } from './types';
import { UserNodeId } from '@genai-fi/recom';

const meta: Meta<typeof Graph> = {
    component: Graph,
};

export default meta;

type Story = StoryObj<typeof Graph>;

const TEST_NODES1: GraphNode<UserNodeId>[] = [
    { id: 'user:xyz1', size: 50 },
    { id: 'user:xyz2', size: 50 },
    { id: 'user:xyz3', size: 50 },
    {
        id: 'user:xyz4',
        size: 30,
    },
    {
        id: 'user:xyz5',
        size: 30,
    },
    {
        id: 'user:xyz6',
        size: 30,
    },
];

export const Primary: Story = {
    args: {
        nodes: TEST_NODES1,
        links: [
            { source: 'user:xyz1', target: 'user:xyz2', strength: 1 },
            { source: 'user:xyz1', target: 'user:xyz3', strength: 0.5 },
        ],
    },
};
