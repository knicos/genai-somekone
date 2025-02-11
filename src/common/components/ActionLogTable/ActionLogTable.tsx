import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@knicos/genai-base';
import { useTranslation } from 'react-i18next';
import { Cards } from '../DataCard';
import LogBatch, { ContentLogEntry } from './LogBatch';
import style from './style.module.css';
import { engagementFromLog, UserNodeId } from '@knicos/genai-recom';

interface Props {
    user?: UserNodeId;
    log: ContentLogEntry[];
    fixedSize?: number;
}

function batchLogs(log: ContentLogEntry[], size: number, startOffset: number): ContentLogEntry[][] {
    const results: ContentLogEntry[][] = [[]];
    if (log.length === 0) return results;

    let counter = size;
    for (let i = 0; i < log.length; ++i) {
        const l = log[i];

        const current = results[results.length - 1];

        if (current.length > 0 && current[0].entry.id !== l.entry.id) {
            if (i >= startOffset) --counter;
            if (counter === 0) break;
            results.push([l]);
        } else {
            current.push(l);
        }
    }

    // The first result may not have engagement
    if (log[0].entry.activity !== 'engagement') {
        const weight = engagementFromLog(results[0].map((l) => l.entry));
        results[0].unshift({
            entry: {
                activity: 'engagement',
                timestamp: log[0].entry.timestamp,
                value: weight,
                id: log[0].entry.id,
            },
            content: log[0].content,
        });
    }

    return results;
}

export default function ActionLogTable({ log, fixedSize }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(fixedSize || 5);
    const firstSize = useRef(log.length);

    useEffect(() => {
        setSize(fixedSize || 5);
    }, [fixedSize]);

    const logLimited = useMemo(() => {
        return batchLogs(log, size, log.length - firstSize.current);
    }, [log, size]);

    return (
        <Cards>
            {logLimited.map((batch, ix) => (
                <LogBatch
                    batch={batch}
                    key={logLimited.length - ix}
                />
            ))}
            {!fixedSize && (
                <li className={style.buttonListItem}>
                    <Button
                        variant="outlined"
                        onClick={() => setSize((s) => s + 5)}
                        sx={{ margin: '1rem 0.5rem' }}
                    >
                        {t('profile.actions.more')}
                    </Button>
                </li>
            )}
        </Cards>
    );
}
