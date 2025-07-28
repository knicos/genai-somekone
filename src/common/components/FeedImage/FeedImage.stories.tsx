import type { Meta, StoryObj } from '@storybook/react';

import FeedImage from './FeedImage';
import { getContentService, getGraphService } from '@genai-fi/recom';

const meta: Meta<typeof FeedImage> = {
    component: FeedImage,
};

export default meta;

type Story = StoryObj<typeof FeedImage>;

getGraphService().reset();
getContentService().addContent(
    'https://images.pexels.com/photos/3030647/pexels-photo-3030647.jpeg?cs=srgb&dl=pexels-nextvoyage-3030647.jpg&fm=jpg',
    { id: 'xyz', author: 'Unknown', labels: [] }
);

export const Primary: Story = {
    args: {
        active: true,
        id: 'content:xyz',
        visible: true,
    },
};
