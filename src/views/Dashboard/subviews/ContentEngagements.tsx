import ContentEngagements from '@genaism/components/Tables/ContentEngagements';
import { useEventListen } from '@genaism/hooks/events';
import { useReducer } from 'react';

export function Component() {
    const [count, refresh] = useReducer((a) => ++a, 0);
    useEventListen('refresh_graph', () => {
        refresh();
    });

    return <ContentEngagements key={`k-${count}`} />;
}
