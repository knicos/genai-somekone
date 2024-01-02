import { beforeEach, describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfileComp from './UserProfile';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { createEmptyProfile } from '@genaism/services/profiler/profiler';
import { resetGraph } from '@genaism/services/graph/state';
import { addEdge } from '@genaism/services/graph/edges';

const { mockProfile } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser'),
        engagedContent: [{ id: 'content:content1', weight: 1 }],
        taste: [{ label: 'taste1', weight: 0.5 }],
    })),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
}));

describe('UserProfile component', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('renders with no topic data', async ({ expect }) => {
        render(<UserProfileComp id="user:xyz" />);
        expect(await screen.findByTestId('wordcloud-group')).toBeInTheDocument();
        expect(screen.getByTestId('cloud-image')).toBeVisible();
        expect(screen.getByText('taste1')).toBeVisible();
    });

    it('shows topic pie charts', async ({ expect }) => {
        mockProfile.mockImplementation(() => ({
            ...createEmptyProfile('user:xyz', 'TestUser2'),
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            commentedTopics: [
                { label: 'topic1', weight: 0.2 },
                { label: 'topic2', weight: 0.3 },
                { label: 'topic3', weight: 0.3 },
            ],
            taste: [{ label: 'taste1', weight: 0.5 }],
        }));
        render(<UserProfileComp id="user:xyz" />);
        expect(await screen.findAllByText('topic1')).toHaveLength(2);
    });

    it('shows topic details', async ({ expect }) => {
        mockProfile.mockImplementation(() => ({
            ...createEmptyProfile('user:xyz', 'TestUser2'),
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            taste: [{ label: 'taste1', weight: 0.5 }],
        }));

        addEdge('engaged', 'user:xyz', 'content:content1', 1);
        addEdge('topic', 'content:content1', 'topic:taste1', 1);

        render(<UserProfileComp id="user:xyz" />);
        expect(await screen.findByText('#taste1')).toBeVisible();
    });
});
