import type { Meta, StoryObj } from '@storybook/react';

import IconMenu from './IconMenu';
import { IconButton } from '@mui/material';
import DriveFolderUploadIcon from '@mui/icons-material/DriveFolderUpload';
import SettingsIcon from '@mui/icons-material/Settings';
import CollectionsIcon from '@mui/icons-material/Collections';
import IconMenuItem from './Item';
import Spacer from './Spacer';

const meta: Meta<typeof IconMenu> = {
    component: IconMenu,
};

export default meta;

type Story = StoryObj<typeof IconMenu>;

export const Primary: Story = {
    render: (args) => (
        <IconMenu {...args}>
            <IconMenuItem tooltip="Test1">
                <IconButton>
                    <DriveFolderUploadIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip="Test2">
                <IconButton>
                    <SettingsIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip="Test3">
                <IconButton>
                    <CollectionsIcon />
                </IconButton>
            </IconMenuItem>
        </IconMenu>
    ),
    args: {
        placement: 'left',
        label: <span>Test</span>,
    },
};
