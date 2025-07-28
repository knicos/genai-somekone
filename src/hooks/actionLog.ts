import { LogEntry, UserNodeId } from '@genai-fi/recom';
import { useEffect, useMemo, useReducer } from 'react';
import { useActionLogService, useBroker } from './services';

export function useActionLog(id: UserNodeId): LogEntry[] {
    const broker = useBroker();
    const actionLog = useActionLogService();
    const aid = id;
    const [count, trigger] = useReducer((a) => ++a, 0);
    useEffect(() => {
        const handler = () => trigger();
        broker.on(`log-${aid}`, handler);
        return () => broker.off(`log-${aid}`, handler);
    }, [aid, broker]);
    return useMemo(
        () =>
            actionLog
                .getActionLog(aid)
                .filter((a) => !!a.id)
                .reverse(),
        // eslint-disable-next-line react-hooks/exhaustive-deps
        [count, aid]
    );
}
