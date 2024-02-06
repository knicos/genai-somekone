import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { useMemo, useState } from 'react';
import { Button } from '../Button/Button';
import { useTranslation } from 'react-i18next';
import Cards from '../DataCard/Cards';
import LogBatch from './LogBatch';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getEdgeWeights } from '@genaism/services/graph/edges';
import { getCurrentUser } from '@genaism/services/profiler/state';

interface Props {
    user?: UserNodeId;
    log: LogEntry[];
}

function batchLogs(user: UserNodeId, log: LogEntry[], size: number): LogEntry[][] {
    const results: LogEntry[][] = [[]];
    if (log.length === 0) return results;

    if (log[0].activity !== 'engagement') {
        const weight = getEdgeWeights('last_engaged', user, log[0].id)[0] || 0;
        results[0].push({
            activity: 'engagement',
            timestamp: log[0].timestamp,
            value: weight,
            id: log[0].id,
        });
    }

    for (let i = 0; i < log.length; ++i) {
        const l = log[i];

        const current = results[results.length - 1];

        if (current.length > 0 && current[0].id !== l.id) {
            if (results.length === size) break;
            results.push([l]);
        } else {
            current.push(l);
        }
    }
    return results;
}

export default function ActionLogTable({ user, log }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(5);

    const logLimited = useMemo(() => {
        return batchLogs(user || getCurrentUser(), log, size);
    }, [log, size, user]);

    return (
        <Cards>
            {logLimited.map((batch, ix) => (
                <LogBatch
                    batch={batch}
                    key={ix}
                />
            ))}
            <Button
                variant="outlined"
                onClick={() => setSize((s) => s + 5)}
                sx={{ margin: '1rem 0.5rem' }}
            >
                {t('profile.actions.more')}
            </Button>
        </Cards>
    );
}
