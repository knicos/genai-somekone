import type { Meta, StoryObj } from '@storybook/react';

import ImageSearch from './ImageSearch';

const meta: Meta<typeof ImageSearch> = {
    component: ImageSearch,
};

export default meta;

type Story = StoryObj<typeof ImageSearch>;

export const Primary: Story = {
    args: {
        columns: 4,
    },
};
