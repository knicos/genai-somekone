import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileNode from './ProfileNode';
import { UserProfile } from '@genaism/services/profiler/profilerTypes';
import TestWrapper from '@genaism/util/TestWrapper';
import { settingDisplayLabel, settingShrinkOfflineUsers } from '@genaism/state/settingsState';
import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';

const { mockProfile, mockSimilar } = vi.hoisted(() => ({
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
        featureWeights: [],
        viewedTopics: [],
        taste: [{ label: 'taste1', weight: 0.5 }],
        attributes: {},
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
        const linksFn = vi.fn();
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            name: 'TestUser1',
            id: 'user:xyz' as UserNodeId,
            engagement: -1,
            engagedContent: [],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            featureWeights: [],
            viewedTopics: [],
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
                        id="user:xyz"
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
            id: 'user:xyz' as UserNodeId,
            engagement: -1,
            engagedContent: [],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            featureWeights: [],
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
                        id="user:xyz"
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
            id: 'user:xyz' as UserNodeId,
            engagement: -1,
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            featureWeights: [],
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
                        id="user:xyz"
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
            id: 'user:xyz' as UserNodeId,
            engagement: -1,
            engagedContent: [{ id: 'content:content1' as ContentNodeId, weight: 1 }],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            featureWeights: [],
            taste: [{ label: 'taste1', weight: 0.5 }],
            attributes: {},
        }));

        mockSimilar.mockImplementation(() => [
            { id: 'user:ddd', weight: 2 },
            { id: 'user:sss', weight: 1.9 },
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
                        id="user:xyz"
                        onLinks={linksFn}
                        onResize={resizeFn}
                        live={true}
                    />
                </svg>
            </TestWrapper>
        );

        expect(linksFn).toHaveBeenCalledWith('user:xyz', [
            { source: 'user:xyz', target: 'user:ddd', strength: 2 },
            { source: 'user:xyz', target: 'user:sss', strength: 1.9 },
        ]);
    });
});
