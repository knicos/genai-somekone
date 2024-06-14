import { act, render, screen } from '@testing-library/react';
import { beforeEach, describe, it, vi } from 'vitest';
import {
    addUserProfile,
    createEmptyProfile,
    createUserProfile,
    resetProfiles,
    reverseProfile,
} from '@genaism/services/profiler/profiler';
import { dumpJSON, resetGraph } from '@genaism/services/graph/state';
import { addEdge, getEdgesOfType } from '@genaism/services/graph/edges';
import { addNode } from '@genaism/services/graph/nodes';
import { ContentNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import { useUserProfile } from './hooks';
import { addProfileListener } from './events';

function UserComponent({ action }: { action: (e: WeightedNode<ContentNodeId>[]) => void }) {
    const user = useUserProfile('user:xyz');
    action(user.affinities.contents.contents);
    return user.name;
}

beforeEach(() => {
    resetGraph();
    resetProfiles();
});

describe('User hooks.useUserProfile', () => {
    it('triggers a rerender on event', async ({ expect }) => {
        addNode('content', 'content:hhh');
        addUserProfile('user:xyz', createEmptyProfile('user:xyz', 'TestUser1'));

        const action = vi.fn();

        render(<UserComponent action={action} />);
        expect(action).toHaveBeenCalledTimes(1);

        await act(() => addEdge('engaged', 'user:xyz', 'content:hhh', 1));
        expect(action).toHaveBeenCalledTimes(2);
        expect(action).toHaveBeenCalledWith([{ id: 'content:hhh', weight: 1 }]);
    });

    it('displays the user name', async ({ expect }) => {
        addUserProfile('user:xyz', createEmptyProfile('user:xyz', 'TestUser2'));

        const action = vi.fn();

        render(<UserComponent action={action} />);
        expect(screen.getByText('TestUser2')).toBeInTheDocument();
    });
});

describe('Profiler.updateProfile', () => {
    it('generates the correct edges', ({ expect }) => {
        addNode('content', 'content:zzz');
        createUserProfile('user:xyz', 'TestUser5');

        const testProfile = createEmptyProfile('user:xyz', 'NoName');
        testProfile.affinities.topics.topics = [{ label: 'fff', weight: 0.5 }];
        testProfile.affinities.contents.contents = [{ id: 'content:zzz', weight: 0.5 }];

        reverseProfile('user:xyz', testProfile);

        console.log(dumpJSON());
        expect(getEdgesOfType('topic', 'user:xyz')).toHaveLength(1);
        expect(getEdgesOfType('engaged', 'user:xyz')).toHaveLength(1);
    });

    it('emits a change event', ({ expect }) => {
        addNode('content', 'content:zzz');
        createUserProfile('user:xyz', 'TestUser5');

        const handler = vi.fn();
        addProfileListener('user:xyz', handler);
        expect(handler).toHaveBeenCalledTimes(0);

        const testProfile = createEmptyProfile('user:xyz', 'NoName');
        testProfile.affinities.topics.topics = [{ label: 'fff', weight: 0.5 }];
        testProfile.affinities.contents.contents = [{ id: 'content:zzz', weight: 0.5 }];

        reverseProfile('user:xyz', testProfile);

        expect(handler).toHaveBeenCalledTimes(1);
    });
});
