import type { Meta, StoryObj } from '@storybook/react';

import ImageCloud from './ImageCloud';

const meta: Meta<typeof ImageCloud> = {
    component: ImageCloud,
    render: (args) => (
        <svg
            viewBox="0 0 500 500"
            width={500}
            height={500}
        >
            <g transform="translate(250, 250)">
                <ImageCloud {...args} />
            </g>
        </svg>
    ),
};

export default meta;

type Story = StoryObj<typeof ImageCloud>;

const TEST_IMAGES = [
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg',
    'https://cdn.pixabay.com/photo/2023/10/20/13/49/beach-8329531_1280.jpg',
    'https://cdn.pixabay.com/photo/2023/11/12/13/24/tide-8382992_1280.jpg',
    'https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg',
];

export const Primary: Story = {
    args: {
        content: [
            { image: TEST_IMAGES[0], weight: 1 },
            { image: TEST_IMAGES[1], weight: 0.8 },
            { image: TEST_IMAGES[2], weight: 0.8 },
            { image: TEST_IMAGES[3], weight: 0.4 },
            { image: TEST_IMAGES[0], weight: 0.2 },
            { image: TEST_IMAGES[1], weight: 0.2 },
            { image: TEST_IMAGES[2], weight: 0.2 },
            { image: TEST_IMAGES[3], weight: 0.2 },
            { image: TEST_IMAGES[0], weight: 0.1 },
            { image: TEST_IMAGES[1], weight: 0.1 },
        ],
        size: 500,
        padding: 10,
        colour: 'green',
        borderSize: 2,
    },
};
