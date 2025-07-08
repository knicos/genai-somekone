import UserGrid from '../views/UserGrid/UserGrid';
import { useEventListen } from '@genaism/hooks/events';
import { menuSelectedUser } from '@genaism/apps/Dashboard/state/menuState';
import { useEffect, useReducer } from 'react';
import { useSetAtom } from 'jotai';

export function Component() {
    const [count, refresh] = useReducer((a) => ++a, 0);
    useEventListen(
        () => {
            refresh();
        },
        [],
        'refresh_graph'
    );

    const setSelectedNode = useSetAtom(menuSelectedUser);
    useEffect(() => {
        setSelectedNode(undefined);
    }, [setSelectedNode]);

    return <UserGrid key={`k-${count}`} />;
}
