import HeatmapCompare from '@genaism/views/HeatmapCompare/HeatmapCompare';
import { useEventListen } from '@genaism/hooks/events';
import { useReducer } from 'react';

export function Component() {
    const [count, refresh] = useReducer((a) => ++a, 0);
    useEventListen(
        () => {
            refresh();
        },
        [],
        'refresh_graph'
    );

    return <HeatmapCompare key={`k-${count}`} />;
}
