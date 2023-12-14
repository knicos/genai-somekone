import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataProfile from './DataProfile';
import { LogEntry, UserProfile } from '@genaism/services/profiler/profilerTypes';
import { createEmptyProfile } from '@genaism/services/profiler/profiler';

const { mockProfile, mockLog } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser1'),
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
            ...createEmptyProfile('user:xyz', 'TestUser1'),
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => []);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
    });

    it('works with content and log data', async ({ expect }) => {
        const profile: UserProfile = {
            ...createEmptyProfile('user:xyz', 'TestUser1'),
            engagedContent: [{ id: 'content:content1', weight: 1 }],
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => [{ id: 'content:ggg', activity: 'like', timestamp: Date.now() } as LogEntry]);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-image')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeInTheDocument();
    });
});
