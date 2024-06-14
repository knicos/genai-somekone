import { useEffect, useMemo, useReducer } from 'react';
import { UserNodeId } from '../graph/graphTypes';
import { LogEntry } from './userTypes';
import { getCurrentUser } from '../profiler/state';
import { addLogListener, removeLogListener } from './events';
import { getActionLog } from './logs';

export function useActionLog(id?: UserNodeId): LogEntry[] {
    const aid = id || getCurrentUser();
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        addLogListener(aid, handler);
        return () => removeLogListener(aid, handler);
    }, [aid]);
    return useMemo(
        () =>
            getActionLog(aid)
                .filter((a) => !!a.id)
                .reverse(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [count, aid]
    );
}
