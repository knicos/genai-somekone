import { Button } from '@genaism/components/Button/Button';
import { createRawEmbedding } from '@genaism/services/content/embedding';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { LinearProgress } from '@mui/material';
import { useEffect, useState } from 'react';
import style from './style.module.css';

const rawCache = new Map<ContentNodeId, number[]>();

export function getRawEmbeddings() {
    return rawCache;
}

export default function RawEmbeddingTool() {
    const [start, setStart] = useState(false);
    const [rawCount, setRawCount] = useState(0);

    useEffect(() => {
        if (start) {
            const nodes = getNodesByType('content');
            setRawCount(0);
            nodes.map((n, ix) => {
                if (!rawCache.has(n)) {
                    createRawEmbedding(n).then((r) => {
                        rawCache.set(n, r);
                        setRawCount((i) => i + 100 / nodes.length);
                        if (ix === nodes.length - 1) setStart(false);
                    });
                } else {
                    setRawCount((i) => i + 100 / nodes.length);
                    if (ix === nodes.length - 1) setStart(false);
                }
            });
        }
    }, [start]);

    return (
        <div className={style.toolContainer}>
            <Button
                disabled={start}
                onClick={() => setStart(true)}
            >
                Calculate Raw Embeddings
            </Button>
            <LinearProgress
                variant="determinate"
                value={rawCount}
            />
        </div>
    );
}
