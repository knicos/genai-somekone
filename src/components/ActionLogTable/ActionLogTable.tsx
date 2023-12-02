import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import LogItem from './LogItem';
import { useMemo, useState } from 'react';
import { Button } from '../Button/Button';
import Table from '../Table/Table';
import { useTranslation } from 'react-i18next';

interface Props {
    log: LogEntry[];
}

export default function ActionLogTable({ log }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(15);

    const logLimited = useMemo(() => {
        return log.slice(0, size);
    }, [log, size]);

    return (
        <>
            <Table>
                {logLimited.map((l, ix) => (
                    <LogItem
                        key={log.length - ix}
                        item={l}
                    />
                ))}
            </Table>
            <Button
                variant="outlined"
                onClick={() => setSize((s) => s + 10)}
                sx={{ margin: '1rem 0.5rem' }}
            >
                {t('profile.actions.more')}
            </Button>
        </>
    );
}
