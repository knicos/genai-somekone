import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import { addUserProfile, appendActionLog, getActionLogSince } from '@genaism/services/profiler/profiler';
import { resetGraph } from '@genaism/services/graph/state';
import { addEdge } from '@genaism/services/graph/edges';
import { addNode } from '@genaism/services/graph/nodes';
import { WeightedNode } from '@genaism/services/graph/graphTypes';
import { useUserProfile } from './hooks';

function UserComponent({ action }: { action: (e: WeightedNode[]) => void }) {
    const user = useUserProfile('xyz');
    action(user.engagedContent);
    return user.name;
}

beforeEach(() => resetGraph());

describe('User hooks.useUserProfile', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('content', 'hhh');
        addUserProfile({
            name: 'TestUser1',
            id: 'xyz',
            engagedContent: [],
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
