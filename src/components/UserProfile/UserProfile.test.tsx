import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import UserProfileComp from './UserProfile';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import { ContentNodeId, UserNodeId } from '@genaism/services/graph/graphTypes';

const { mockProfile } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        name: 'TestUser1',
        id: 'user:xyz',
        engagement: -1,
        engagedContent: [{ id: 'content:content1', weight: 1 }],
        commentedTopics: [],
        reactedTopics: [],
        sharedTopics: [],
        followedTopics: [],
        seenTopics: [],
        viewedTopics: [],
        taste: [{ label: 'taste1', weight: 0.5 }],
        attributes: {},
    })),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
}));

describe('UserProfile component', () => {
    it('renders with no topic data', async ({ expect }) => {
        render(<UserProfileComp id="user:xyz" />);
        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
        expect(screen.getByTestId('cloud-image')).toBeVisible();
        expect(screen.getByText('taste1')).toBeVisible();
    });

    it('shows topic pie charts', async ({ expect }) => {
        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'user:xyz' as UserNodeId,
            engagement: -1,
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            commentedTopics: [
                { label: 'topic1', weight: 0.2 },
                { label: 'topic2', weight: 0.3 },
                { label: 'topic3', weight: 0.3 },
            ],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            taste: [{ label: 'taste1', weight: 0.5 }],
            attributes: {},
        }));
        render(<UserProfileComp id="user:xyz" />);
        expect(await screen.findByText('topic1')).toBeInTheDocument();
        expect(await screen.findByText('topic2')).toBeInTheDocument();
    });
});
