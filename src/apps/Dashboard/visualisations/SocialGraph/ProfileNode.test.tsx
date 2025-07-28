import { describe, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import ProfileNode from './ProfileNode';
import TestWrapper from '@genaism/util/TestWrapper';
import { settingDisplayLabel, settingShrinkOfflineUsers } from '@genaism/apps/Dashboard/state/settingsState';
import { ContentNodeId, createEmptyProfile, UserNodeData, UserNodeId, WeightedNode } from '@genai-fi/recom';
import { createStore } from 'jotai';

const { mockProfile, mockSimilar } = vi.hoisted(() => ({
    mockProfile: vi.fn<(a: unknown[]) => UserNodeData>(() => {
        const profile = createEmptyProfile('user:xyz', 'TestUser1');
        profile.affinities.contents.contents = [{ id: 'content:content1', weight: 1 }];
        profile.affinities.topics.topics = [{ label: 'taste1', weight: 0.5 }];
        return profile;
    }),
    mockSimilar: vi.fn(() => [] as WeightedNode<UserNodeId>[]),
}));

vi.mock('@genaism/hooks/profiler', () => ({
    useUserProfile: mockProfile,
    useSimilarUsers: mockSimilar,
}));

const store = createStore();
store.set(settingDisplayLabel, true);
store.set(settingShrinkOfflineUsers, false);

describe('ProfileNode component', () => {
    it('shows a circle and label on an empty profile', async ({ expect }) => {
        const resizeFn = vi.fn();

        mockProfile.mockImplementation(() => ({
            ...createEmptyProfile('user:xyz', 'TestUser1'),
        }));

        render(
            <TestWrapper initializeState={store}>
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

        mockProfile.mockImplementation(() => {
            const profile = createEmptyProfile('user:xyz', 'TestUser1');
            profile.affinities.contents.contents = [{ id: 'content:content1' as ContentNodeId, weight: 1 }];
            profile.affinities.topics.topics = [{ label: 'taste1', weight: 0.5 }];
            return profile;
        });

        render(
            <TestWrapper initializeState={store}>
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
