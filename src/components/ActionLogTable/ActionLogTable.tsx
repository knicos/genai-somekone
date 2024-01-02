import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { useMemo, useState } from 'react';
import { Button } from '../Button/Button';
import { useTranslation } from 'react-i18next';
import Cards from '../DataCard/Cards';
import LogBatch from './LogBatch';

interface Props {
    log: LogEntry[];
}

function batchLogs(log: LogEntry[], size: number): LogEntry[][] {
    const results: LogEntry[][] = [[]];
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

export default function ActionLogTable({ log }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(5);

    const logLimited = useMemo(() => {
        return batchLogs(log, size);
    }, [log, size]);

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
