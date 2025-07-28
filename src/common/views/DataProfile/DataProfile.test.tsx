import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import DataProfile from './DataProfile';
import { createEmptyProfile, LogEntry, UserNodeData } from '@genai-fi/recom';
import TestWrapper from '@genaism/util/TestWrapper';

const { mockProfile, mockLog } = vi.hoisted(() => ({
    mockProfile: vi.fn<(a: unknown[]) => UserNodeData>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser1'),
    })),
    mockLog: vi.fn<(a: unknown[]) => LogEntry[]>(() => []),
}));

vi.mock('@genaism/hooks/profiler', () => ({
    useUserProfile: mockProfile,
}));

vi.mock('@genaism/hooks/actionLog', () => ({
    useActionLog: mockLog,
}));

describe('DataProfile component', () => {
    it('works with no content or log data', async ({ expect }) => {
        const profile: UserNodeData = {
            ...createEmptyProfile('user:xyz', 'TestUser1'),
        };

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => []);
        render(<DataProfile />, { wrapper: TestWrapper });

        expect(await screen.findByTestId('cloud-group')).toBeInTheDocument();
    });

    it('works with content and log data', async ({ expect }) => {
        const profile: UserNodeData = createEmptyProfile('user:xyz', 'TestUser1');
        profile.affinities.contents.contents = [{ id: 'content:content1', weight: 1 }];

        mockProfile.mockImplementation(() => profile);
        mockLog.mockImplementation(() => [{ id: 'content:ggg', activity: 'like', timestamp: Date.now() } as LogEntry]);
        render(<DataProfile />, { wrapper: TestWrapper });

        expect(await screen.findByTestId('cloud-image')).toBeInTheDocument();
        expect(screen.getByText('feed.actionlog.like')).toBeInTheDocument();
    });
});
