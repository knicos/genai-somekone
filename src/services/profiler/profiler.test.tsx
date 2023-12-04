import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import {
    addLogEntry,
    addUserProfile,
    appendActionLog,
    createUserProfile,
    getActionLogSince,
    getCurrentUser,
    resetProfiles,
    updateProfile,
} from '@genaism/services/profiler/profiler';
import { resetGraph } from '@genaism/services/graph/state';
import { addEdge, getEdgeWeights, getEdgesOfType } from '@genaism/services/graph/edges';
import { addNode } from '@genaism/services/graph/nodes';
import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { useActionLog, useUserProfile } from './hooks';
import { LogEntry, ProfileSummary } from './profilerTypes';
import { addProfileListener } from './events';

function UserComponent({ action }: { action: (e: WeightedNode[]) => void }) {
    const user = useUserProfile('xyz');
    action(user.engagedContent);
    return user.name;
}

function LogComponent({ action }: { action: (e: LogEntry[]) => void }) {
    const log = useActionLog('xyz');
    action(log);
    return 'test';
}

beforeEach(() => {
    resetGraph();
    resetProfiles();
});

describe('User hooks.useUserProfile', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('content', 'hhh');
        addUserProfile({
            name: 'TestUser1',
            id: 'xyz',
            engagedContent: [],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            taste: [],
            engagement: -1,
            attributes: {},
        });

        const action = vi.fn();

        render(<UserComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        act(() => addEdge('engaged', 'xyz', 'hhh', 1));
        expect(action).toHaveBeenCalledTimes(2);
        expect(action).toHaveBeenCalledWith([{ id: 'hhh', weight: 1 }]);
    });

    it('displays the user name', async ({ expect }) => {
        addUserProfile({
            name: 'TestUser2',
            id: 'xyz',
            engagedContent: [],
            commentedTopics: [],
            reactedTopics: [],
            sharedTopics: [],
            followedTopics: [],
            seenTopics: [],
            viewedTopics: [],
            taste: [],
            engagement: -1,
            attributes: {},
        });

        const action = vi.fn();

        render(<UserComponent action={action} />);
        expect(screen.getByText('TestUser2')).toBeInTheDocument();
    });
});

describe('User hooks.useActionLog', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        createUserProfile('xyz', 'TestUser');
        appendActionLog([{ activity: 'like', id: 'fff', timestamp: Date.now() }], 'xyz');

        const action = vi.fn();

        render(<LogComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);
        act(() => appendActionLog([{ activity: 'love', id: 'fff', timestamp: Date.now() }], 'xyz'));
        expect(action).toHaveBeenCalledTimes(2);
        expect(action).toHaveBeenCalledWith([{ activity: 'like', id: 'fff', timestamp: expect.any(Number) }]);
    });
});

describe('Action Logs.getActionLogSince', () => {
    it('only returns new items', async ({ expect }) => {
        appendActionLog(
            [
                { timestamp: 10, activity: 'like' },
                { timestamp: 11, activity: 'like' },
                { timestamp: 12, activity: 'like' },
                { timestamp: 13, activity: 'like' },
                { timestamp: 14, activity: 'like' },
            ],
            'xyz'
        );

        const results = getActionLogSince(12, 'xyz');

        expect(results).toHaveLength(2);
        expect(results[0].timestamp).toBe(13);
        expect(results[1].timestamp).toBe(14);
    });
});

describe('Profiler.addLogEntry', () => {
    it('updates profile on like', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'like', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('topic', getCurrentUser(), 'topic1')[0]).toBe(0.1);
        expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic1')[0]).toBe(0.1);
        expect(getEdgeWeights('reacted_topic', getCurrentUser(), 'topic1')[0]).toBe(1);
    });

    it('updates profile on shared', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'share_friends', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('topic', getCurrentUser(), 'topic1')[0]).toBe(0.3);
        expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic1')[0]).toBe(0.3);
        expect(getEdgeWeights('shared_topic', getCurrentUser(), 'topic1')[0]).toBe(1);
    });

    it('updates profile on follow', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'follow', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('topic', getCurrentUser(), 'topic1')[0]).toBe(0.5);
        expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic1')[0]).toBe(0.5);
        expect(getEdgeWeights('followed_topic', getCurrentUser(), 'topic1')[0]).toBe(1);
    });

    it('updates profile on love', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'love', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('topic', getCurrentUser(), 'topic1')[0]).toBe(0.2);
        expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic1')[0]).toBe(0.2);
        expect(getEdgeWeights('reacted_topic', getCurrentUser(), 'topic1')[0]).toBe(1);
    });

    it('records seen actions', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'seen', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('seen_topic', getCurrentUser(), 'topic1')[0]).toBe(1);
    });

    it('accounts for seen in topic score', async ({ expect }) => {
        addNode('content', 'content1');
        addNode('topic', 'topic1');
        addEdge('topic', 'content1', 'topic1', 1);

        addLogEntry({ activity: 'seen', timestamp: Date.now(), id: 'content1' });
        addLogEntry({ activity: 'seen', timestamp: Date.now(), id: 'content1' });
        addLogEntry({ activity: 'like', timestamp: Date.now(), id: 'content1' });

        expect(getEdgeWeights('seen_topic', getCurrentUser(), 'topic1')[0]).toBe(2);
        expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic1')[0]).toBe(0.1);
        expect(getEdgeWeights('topic', getCurrentUser(), 'topic1')[0]).toBe(0.1 / 2);
    });
});

describe('Profiler.updateProfile', () => {
    it('generates the correct edges', ({ expect }) => {
        addNode('content', 'zzz');
        createUserProfile('xyz', 'TestUser5');

        updateProfile('xyz', {
            taste: [{ label: 'fff', weight: 0.5 }],
            engagedContent: [{ id: 'zzz', weight: 0.5 }],
            reactedTopics: [],
            commentedTopics: [],
            followedTopics: [],
            sharedTopics: [],
            viewedTopics: [],
            seenTopics: [],
        } as ProfileSummary);

        expect(getEdgesOfType('topic', 'xyz')).toHaveLength(1);
        expect(getEdgesOfType('engaged', 'xyz')).toHaveLength(1);
    });

    it('emits a change event', ({ expect }) => {
        addNode('content', 'zzz');
        createUserProfile('xyz', 'TestUser5');

        const handler = vi.fn();
        addProfileListener('xyz', handler);
        expect(handler).toHaveBeenCalledTimes(0);

        updateProfile('xyz', {
            taste: [{ label: 'fff', weight: 0.5 }],
            engagedContent: [{ id: 'zzz', weight: 0.5 }],
            reactedTopics: [],
            commentedTopics: [],
            followedTopics: [],
            sharedTopics: [],
            viewedTopics: [],
            seenTopics: [],
        } as ProfileSummary);

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
