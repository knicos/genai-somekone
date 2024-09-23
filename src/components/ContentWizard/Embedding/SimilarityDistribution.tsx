import style from '../style.module.css';
import { useEffect, useReducer, useState } from 'react';
import { embeddingSimilarity } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import { BarChart } from '@mui/x-charts';
import { useEventListen } from '@genaism/hooks/events';

export default function SimilarityDistribution() {
    const [count, bump] = useReducer((o) => o + 1, 0);
    const [distribution, setDistribution] = useState<{ x: number; y: number }[]>([]);
    const contentSvc = useContentService();

    useEventListen('refresh_embeddings', () => {
        bump();
    });

    useEffect(() => {
        const nodes = contentSvc.graph.getNodesByType('content');
        // Calc distribution
        const BUCKETS = 30;
        const dist = new Array(BUCKETS).fill(0);
        const min = -1;
        const max = 1;
        const d = max - min;

        nodes.forEach((n1, i1) => {
            const meta1 = contentSvc.getContentMetadata(n1);

            if (meta1) {
                nodes.forEach((n2, i2) => {
                    if (i2 <= i1) return;
                    const meta2 = contentSvc.getContentMetadata(n2);

                    if (meta2 && meta1.embedding && meta2.embedding) {
                        const sim = embeddingSimilarity(meta1.embedding, meta2.embedding);
                        const bucket = Math.floor(((sim - min) / d) * (BUCKETS - 1) + 0.5);
                        dist[bucket] += 1;
                    }
                });
            }
        });

        setDistribution(dist.map((d, ix) => ({ x: Math.floor(((ix / BUCKETS) * 2 - 1) * 10), y: d })));

        console.log(dist);
    }, [count, contentSvc]);

    return (
        <div
            className={style.row}
            style={{ padding: '1rem' }}
        >
            <BarChart
                series={[{ dataKey: 'y' }]}
                yAxis={[{ min: 0, max: distribution.reduce((m, d) => Math.max(m, d.y), 0) }]}
                dataset={distribution}
                height={150}
                margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                xAxis={[
                    {
                        scaleType: 'band',
                        dataKey: 'x',
                    },
                ]}
            />
        </div>
    );
}
