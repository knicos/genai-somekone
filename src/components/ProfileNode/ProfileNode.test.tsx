import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileNode from './ProfileNode';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import TestWrapper from '@genaism/util/TestWrapper';
import { settingDisplayLabel, settingShrinkOfflineUsers } from '@genaism/state/settingsState';

const { mockProfile, mockSimilar } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        name: 'TestUser1',
        id: 'xyz',
        engagement: -1,
        engagedContent: [{ id: 'content1', weight: 1 }],
        taste: [{ label: 'taste1', weight: 0.5 }],
        attributes: {},
    })),
    mockSimilar: vi.fn(),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
}));
vi.mock('@genaism/services/users/users', () => ({
    useSimilarUsers: mockSimilar,
}));

describe('ProfileNode component', () => {
    it('shows a circle and label on an empty profile', async ({ expect }) => {
        const linksFn = vi.fn();
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'xyz',
            engagement: -1,
            engagedContent: [],
            taste: [],
            attributes: {},
        }));

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingDisplayLabel, true);
                    set(settingShrinkOfflineUsers, false);
                }}
            >
                <svg>
                    <ProfileNode
                        id="xyz"
                        onLinks={linksFn}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(screen.getByTestId('profile-circle')).toBeInTheDocument();
        expect(screen.getByText('TestUser1')).toBeInTheDocument();
    });

    it('does not show the label if setting is false', async ({ expect }) => {
        const linksFn = vi.fn();
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'xyz',
            engagement: -1,
            engagedContent: [],
            taste: [],
            attributes: {},
        }));

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingDisplayLabel, false);
                    set(settingShrinkOfflineUsers, false);
                }}
            >
                <svg>
                    <ProfileNode
                        id="xyz"
                        onLinks={linksFn}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(screen.getByTestId('profile-circle')).toBeInTheDocument();
        expect(screen.queryByText('TestUser1')).not.toBeInTheDocument();
    });

    it('shows a single content item', async ({ expect }) => {
        const linksFn = vi.fn();
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'xyz',
            engagement: -1,
            engagedContent: [{ id: 'content1', weight: 1 }],
            taste: [{ label: 'taste1', weight: 0.5 }],
            attributes: {},
        }));

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingDisplayLabel, true);
                    set(settingShrinkOfflineUsers, false);
                }}
            >
                <svg>
                    <ProfileNode
                        id="xyz"
                        onLinks={linksFn}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(screen.getByTestId('cloud-image')).toBeInTheDocument();
        expect(resizeFn).toHaveBeenCalled();
    });

    it('generates similar user links', async ({ expect }) => {
        const linksFn = vi.fn();
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'xyz',
            engagement: -1,
            engagedContent: [{ id: 'content1', weight: 1 }],
            taste: [{ label: 'taste1', weight: 0.5 }],
            attributes: {},
        }));

        mockSimilar.mockImplementation(() => [
            { id: 'ddd', weight: 2 },
            { id: 'sss', weight: 1 },
        ]);

        render(
            <TestWrapper
                initializeState={({ set }) => {
                    set(settingDisplayLabel, true);
                    set(settingShrinkOfflineUsers, false);
                }}
            >
                <svg>
                    <ProfileNode
                        id="xyz"
                        onLinks={linksFn}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(linksFn).toHaveBeenCalledWith('xyz', [
            { source: 'xyz', target: 'ddd', strength: 2 },
            { source: 'xyz', target: 'sss', strength: 1 },
        ]);
    });
});
