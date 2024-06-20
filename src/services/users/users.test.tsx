import { beforeEach, describe, it, vi } from 'vitest';
import { act, render } from '@testing-library/react';
import { resetGraph } from '../graph/state';
import { addNode } from '../graph/nodes';
import { addEdge, getEdgeWeights } from '../graph/edges';
import { makeUserSnapshot } from './users';
import { useActionLog } from './hooks';
import { LogEntry } from './userTypes';
import { addLogEntry, appendActionLog, getActionLogSince } from './logs';
import { getCurrentUser, resetProfiles } from '../profiler/state';

function LogComponent({ action }: { action: (e: LogEntry[]) => void }) {
    const log = useActionLog('user:xyz');
    action(log);
    return 'test';
}

describe('Users makeUserSnapshot()', () => {
    beforeEach(() => {
        resetGraph();
    });

    it('captures changed nodes', async ({ expect }) => {
        addNode('user', 'user:1');
        addNode('user', 'user:2');
        addNode('user', 'user:3');
        addNode('user', 'user:4');

        const results = makeUserSnapshot('user:1', 5000, true);
        expect(results.nodes).toHaveLength(3);
    });

    it('captures new logs', async ({ expect }) => {
        appendActionLog(
            [
                { timestamp: 10, activity: 'engagement', value: 1 },
                { timestamp: 11, activity: 'engagement', value: 1 },
                { timestamp: 12, activity: 'engagement', value: 1 },
                { timestamp: 13, activity: 'engagement', value: 1 },
                { timestamp: 14, activity: 'engagement', value: 1 },
            ],
            'user:xyz'
        );
        appendActionLog(
            [
                { timestamp: 15, activity: 'engagement', value: 1 },
                { timestamp: 16, activity: 'engagement', value: 1 },
                { timestamp: 17, activity: 'engagement', value: 1 },
                { timestamp: 18, activity: 'engagement', value: 1 },
                { timestamp: 19, activity: 'engagement', value: 1 },
            ],
            'user:xyz2'
        );

        const results = makeUserSnapshot('user:xyz', 12, true);
        expect(results.logs).toHaveLength(7);
        expect(results.logs[0].user).toBe('user:xyz');
        expect(results.logs[0].entry.timestamp).toBe(13);
    });

    it('captures new logs without user', async ({ expect }) => {
        appendActionLog(
            [
                { timestamp: 10, activity: 'engagement', value: 1 },
                { timestamp: 11, activity: 'engagement', value: 1 },
                { timestamp: 12, activity: 'engagement', value: 1 },
                { timestamp: 13, activity: 'engagement', value: 1 },
                { timestamp: 14, activity: 'engagement', value: 1 },
            ],
            'user:xyz'
        );
        appendActionLog(
            [
                { timestamp: 15, activity: 'engagement', value: 1 },
                { timestamp: 16, activity: 'engagement', value: 1 },
                { timestamp: 17, activity: 'engagement', value: 1 },
                { timestamp: 18, activity: 'engagement', value: 1 },
                { timestamp: 19, activity: 'engagement', value: 1 },
            ],
            'user:xyz2'
        );

        const results = makeUserSnapshot('user:xyz', 12, false);
        expect(results.logs).toHaveLength(5);
        expect(results.logs[0].user).toBe('user:xyz2');
        expect(results.logs[0].entry.timestamp).toBe(15);
    });
});

describe('User hooks.useActionLog', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        // createUserProfile('user:xyz', 'TestUser');
        appendActionLog([{ activity: 'like', id: 'content:fff', timestamp: Date.now() }], 'user:xyz');

        const action = vi.fn();

        render(<LogComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);
        act(() => appendActionLog([{ activity: 'like', id: 'content:ffd', timestamp: Date.now() }], 'user:xyz'));
        expect(action).toHaveBeenCalledTimes(2);
        expect(action).toHaveBeenCalledWith([{ activity: 'like', id: 'content:fff', timestamp: expect.any(Number) }]);
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
            'user:xyz'
        );

        const results = getActionLogSince(12, 'user:xyz');

        expect(results).toHaveLength(2);
        expect(results[0].timestamp).toBe(13);
        expect(results[1].timestamp).toBe(14);
    });
});

describe('User.addLogEntry', () => {
    beforeEach(() => {
        resetGraph();
        resetProfiles();
    });

    it('updates profile on like', async ({ expect }) => {
        addNode('content', 'content:content1');
        addNode('topic', 'topic:topic1');
        addEdge('topic', 'content:content1', 'topic:topic1', 1);

        addLogEntry({ activity: 'like', timestamp: Date.now(), id: 'content:content1' });

        expect(getEdgeWeights('last_engaged', getCurrentUser(), 'content:content1')[0]).toBe(0.1);
        //expect(getEdgeWeights('topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.1);
        //expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.1);
        expect(getEdgeWeights('reacted_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(1);
    });

    it('updates profile on shared', async ({ expect }) => {
        addNode('content', 'content:content1');
        addNode('topic', 'topic:topic1');
        addEdge('topic', 'content:content1', 'topic:topic1', 1);

        addLogEntry({ activity: 'share_friends', timestamp: Date.now(), id: 'content:content1' });

        expect(getEdgeWeights('last_engaged', getCurrentUser(), 'content:content1')[0]).toBe(0.3);

        //expect(getEdgeWeights('topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.3);
        //expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.3);
        expect(getEdgeWeights('shared_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(1);
    });

    it('updates profile on follow', async ({ expect }) => {
        addNode('content', 'content:content1');
        addNode('topic', 'topic:topic1');
        addEdge('topic', 'content:content1', 'topic:topic1', 1);

        addLogEntry({ activity: 'follow', timestamp: Date.now(), id: 'content:content1' });

        expect(getEdgeWeights('last_engaged', getCurrentUser(), 'content:content1')[0]).toBe(0.5);

        //expect(getEdgeWeights('topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.5);
        //expect(getEdgeWeights('engaged_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(0.5);
        expect(getEdgeWeights('followed_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(1);
    });

    it('records seen actions', async ({ expect }) => {
        addNode('content', 'content:content1');
        addNode('topic', 'topic:topic1');
        addEdge('topic', 'content:content1', 'topic:topic1', 1);

        addLogEntry({ activity: 'seen', timestamp: Date.now(), id: 'content:content1' });

        expect(getEdgeWeights('seen_topic', getCurrentUser(), 'topic:topic1')[0]).toBe(1);
    });
});
