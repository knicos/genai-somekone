import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import { addUserProfile, useUserProfile } from './users';
import { resetGraph } from '../graph/state';
import { addEdge } from '../graph/edges';
import { addNode } from '../graph/nodes';
import { WeightedNode } from '../graph/graphTypes';

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
            similarUsers: [],
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
            similarUsers: [],
            taste: [],
            engagement: -1,
            attributes: {},
        });

        const action = vi.fn();

        render(<UserComponent action={action} />);
        expect(screen.getByText('TestUser2')).toBeInTheDocument();
    });
});
