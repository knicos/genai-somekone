import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataProfile from './DataProfile';
import { LogEntry, UserProfile } from '@genaism/services/profiler/profilerTypes';

const { mockProfile, mockLog } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        name: 'TestUser1',
        id: 'user:xyz',
        engagement: -1,
        engagedContent: [],
        commentedTopics: [],
        reactedTopics: [],
        sharedTopics: [],
        followedTopics: [],
        seenTopics: [],
        viewedTopics: [],
        taste: [],
        attributes: {},
    })),
    mockLog: vi.fn<unknown[], LogEntry[]>(() => []),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
    useActionLog: mockLog,
}));

describe('DataProfile component', () => {
    it('works with no content or log data', async ({ expect }) => {
        const profile: UserProfile = {
            name: 'TestUser1',
            id: 'user:xyz',
            engagement: -1,
            engagedContent: [],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            taste: [],
            attributes: {},
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => []);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
    });

    it('works with content and log data', async ({ expect }) => {
        const profile: UserProfile = {
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
            taste: [],
            attributes: {},
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => [{ id: 'content:ggg', activity: 'like', timestamp: Date.now() } as LogEntry]);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-image')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeInTheDocument();
    });
});
