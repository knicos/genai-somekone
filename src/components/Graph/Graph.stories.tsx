import type { Meta, StoryObj } from '@storybook/react';

import Graph from './Graph';

const meta: Meta<typeof Graph> = {
    component: Graph,
};

export default meta;

type Story = StoryObj<typeof Graph>;

const TEST_NODES1 = [
    { id: 'xyz1', size: 50, component: <text>Test1</text> },
    { id: 'xyz2', size: 50, component: <text>Test2</text> },
    { id: 'xyz3', size: 50, component: <text>Test3</text> },
    {
        id: 'xyz4',
        size: 30,
        component: (
            <circle
                r={10}
                fill="red"
            />
        ),
    },
    {
        id: 'xyz5',
        size: 30,
        component: (
            <circle
                r={10}
                fill="red"
            />
        ),
    },
    {
        id: 'xyz6',
        size: 30,
        component: (
            <circle
                r={10}
                fill="red"
            />
        ),
    },
];

export const Primary: Story = {
    args: {
        nodes: TEST_NODES1,
        links: [
            { source: 'xyz1', target: 'xyz2', strength: 1 },
            { source: 'xyz1', target: 'xyz3', strength: 0.5 },
        ],
    },
};
