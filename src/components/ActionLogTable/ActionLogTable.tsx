import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import LogItem from './LogItem';
import style from './style.module.css';
import { useMemo, useState } from 'react';
import { Button } from '../Button/Button';

interface Props {
    log: LogEntry[];
}

export default function ActionLogTable({ log }: Props) {
    const [size, setSize] = useState(15);

    const logLimited = useMemo(() => {
        return log.slice(0, size);
    }, [log, size]);

    return (
        <>
            <table
                className={style.table}
                data-testid="log-table"
            >
                <tbody>
                    {logLimited.map((l, ix) => (
                        <LogItem
                            key={log.length - ix}
                            item={l}
                        />
                    ))}
                </tbody>
            </table>
            <Button
                variant="outlined"
                onClick={() => setSize((s) => s + 10)}
                sx={{ margin: '1rem 0.5rem' }}
            >
                More
            </Button>
        </>
    );
}
