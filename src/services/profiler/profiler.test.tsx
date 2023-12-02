import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import {
    addLogEntry,
    addUserProfile,
    appendActionLog,
    getActionLogSince,
    getCurrentUser,
    resetProfiles,
} from '@genaism/services/profiler/profiler';
import { resetGraph } from '@genaism/services/graph/state';
import { addEdge, getEdgeWeights } from '@genaism/services/graph/edges';
import { addNode } from '@genaism/services/graph/nodes';
import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { useUserProfile } from './hooks';

function UserComponent({ action }: { action: (e: WeightedNode[]) => void }) {
    const user = useUserProfile('xyz');
    action(user.engagedContent);
    return user.name;
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
