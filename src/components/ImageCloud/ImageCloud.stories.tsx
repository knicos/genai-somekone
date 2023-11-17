import type { Meta, StoryObj } from '@storybook/react';

import ImageCloud from './ImageCloud';
import { addContent } from '@genaism/services/content/content';
import { resetGraph } from '@genaism/services/graph/graph';

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

resetGraph();
addContent(
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg',
    { id: 'image1', author: 'Unknown', labels: [] }
);
addContent('https://cdn.pixabay.com/photo/2023/10/20/13/49/beach-8329531_1280.jpg', {
    id: 'image2',
    author: 'Unknown',
    labels: [],
});
addContent('https://cdn.pixabay.com/photo/2023/11/12/13/24/tide-8382992_1280.jpg', {
    id: 'image3',
    author: 'Unknown',
    labels: [],
});
addContent('https://cdn.pixabay.com/photo/2015/04/23/22/00/tree-736885_1280.jpg', {
    id: 'image4',
    author: 'Unknown',
    labels: [],
});

export const Primary: Story = {
    args: {
        content: [
            { id: 'image1', weight: 1 },
            { id: 'image2', weight: 0.8 },
            { id: 'image3', weight: 0.8 },
            { id: 'image4', weight: 0.4 },
            { id: 'image2', weight: 0.2 },
            { id: 'image1', weight: 0.2 },
            { id: 'image3', weight: 0.2 },
            { id: 'image4', weight: 0.2 },
            { id: 'image1', weight: 0.1 },
            { id: 'image3', weight: 0.1 },
        ],
        size: 500,
        padding: 10,
        colour: 'green',
        borderSize: 2,
    },
};
