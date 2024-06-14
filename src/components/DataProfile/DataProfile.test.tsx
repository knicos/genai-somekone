import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataProfile from './DataProfile';
import { createEmptyProfile } from '@genaism/services/profiler/profiler';
import { LogEntry, UserNodeData } from '@genaism/services/users/userTypes';

const { mockProfile, mockLog } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserNodeData>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser1'),
    })),
    mockLog: vi.fn<unknown[], LogEntry[]>(() => []),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
}));

vi.mock('@genaism/services/users/hooks', () => ({
    useActionLog: mockLog,
}));

describe('DataProfile component', () => {
    it('works with no content or log data', async ({ expect }) => {
        const profile: UserNodeData = {
            ...createEmptyProfile('user:xyz', 'TestUser1'),
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => []);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
    });

    it('works with content and log data', async ({ expect }) => {
        const profile: UserNodeData = createEmptyProfile('user:xyz', 'TestUser1');
        profile.affinities.contents.contents = [{ id: 'content:content1', weight: 1 }];

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => [{ id: 'content:ggg', activity: 'like', timestamp: Date.now() } as LogEntry]);
        render(<DataProfile />);

        expect(await screen.findByTestId('cloud-image')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeInTheDocument();
    });
});
