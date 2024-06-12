import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileNode from './ProfileNode';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import TestWrapper from '@genaism/util/TestWrapper';
import { settingDisplayLabel, settingShrinkOfflineUsers } from '@genaism/state/settingsState';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { createEmptyProfile } from '@genaism/services/profiler/profiler';

const { mockProfile, mockSimilar } = vi.hoisted(() => ({
    mockProfile: vi.fn<unknown[], UserProfile>(() => ({
        ...createEmptyProfile('user:xyz', 'TestUser1'),
        engagedContent: [{ id: 'content:content1', weight: 1 }],
        topics: [{ label: 'taste1', weight: 0.5 }],
    })),
    mockSimilar: vi.fn(() => [] as WeightedNode<UserNodeId>[]),
}));

vi.mock('@genaism/services/profiler/hooks', () => ({
    useUserProfile: mockProfile,
}));
vi.mock('@genaism/services/users/users', () => ({
    useSimilarUsers: mockSimilar,
}));

describe('ProfileNode component', () => {
    it('shows a circle and label on an empty profile', async ({ expect }) => {
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            ...createEmptyProfile('user:xyz', 'TestUser1'),
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
                        node={{ id: 'user:xyz', size: 100 }}
                        id="user:xyz"
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(screen.getByTestId('profile-circle')).toBeInTheDocument();
    });

    it('shows a single content item', async ({ expect }) => {
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            ...createEmptyProfile('user:xyz', 'TestUser1'),
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            topics: [{ label: 'taste1', weight: 0.5 }],
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
                        id="user:xyz"
                        node={{ id: 'user:xyz', size: 100 }}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(screen.getByTestId('cloud-image')).toBeInTheDocument();
        expect(resizeFn).toHaveBeenCalled();
    });
});
