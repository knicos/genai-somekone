import { useEffect, useState } from 'react';
import { Button } from '@genai-fi/base';
import { useTranslation } from 'react-i18next';
import { Cards } from '../DataCard';
import LogBatch, { ContentLogEntry } from './LogBatch';
import style from './style.module.css';
import { UserNodeId } from '@knicos/genai-recom';
import { batchLogs } from './batchers';

interface Props {
    user?: UserNodeId;
    log: ContentLogEntry[];
    fixedSize?: number;
}

export default function ActionLogTable({ log, fixedSize }: Props) {
    const { t } = useTranslation();
    const [size, setSize] = useState(fixedSize || 5);
    const [logLimited, setLogs] = useState<ContentLogEntry[][]>([]);

    useEffect(() => {
        setSize(fixedSize || 5);
    }, [fixedSize]);

    useEffect(() => {
        setLogs((old) => {
            const batched = batchLogs(log, old);
            return batched;
        });
    }, [log]);

    return (
        <Cards>
            {logLimited.slice(0, size).map((batch, ix) => (
                <LogBatch
                    batch={batch}
                    key={ix}
                />
            ))}
            {!fixedSize && (
                <li className={style.buttonListItem}>
                    <Button
                        variant="outlined"
                        onClick={() => {
                            setSize((s) => s + 5);
                        }}
                        sx={{ margin: '1rem 0.5rem' }}
                    >
                        {t('profile.actions.more')}
                    </Button>
                </li>
            )}
        </Cards>
    );
}
