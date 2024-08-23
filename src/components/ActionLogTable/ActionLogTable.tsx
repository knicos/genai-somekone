import { useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '@knicos/genai-base';
import { useTranslation } from 'react-i18next';
import Cards from '../DataCard/Cards';
import LogBatch, { ContentLogEntry } from './LogBatch';
import style from './style.module.css';
import { UserNodeId } from '@knicos/genai-recom';

interface Props {
    user?: UserNodeId;
    log: ContentLogEntry[];
    fixedSize?: number;
}

function batchLogs(log: ContentLogEntry[], size: number, startOffset: number): ContentLogEntry[][] {
    const results: ContentLogEntry[][] = [[]];
    if (log.length === 0) return results;

    /*if (log[0].activity !== 'engagement') {
        const weight = graph.getEdgeWeights('last_engaged', user, log[0].id)[0] || 0;
        results[0].push({
            activity: 'engagement',
            timestamp: log[0].timestamp,
            value: weight,
            id: log[0].id,
        });
    }*/

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
