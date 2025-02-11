import style from '../style.module.css';
import { useEffect, useReducer, useState } from 'react';
import { ContentNodeId, embeddingSimilarity, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import ImageGrid from '@genaism/common/components/ImageGrid/ImageGrid';
import { BarChart } from '@mui/x-charts';
import { useEventListen } from '@genaism/hooks/events';

export default function SimilarityChecker() {
    const [count, bump] = useReducer((o) => o + 1, 0);
    const [selected, setSelected] = useState<ContentNodeId>();
    const [similar, setSimilar] = useState<WeightedNode<ContentNodeId>[]>([]);
    const [distribution, setDistribution] = useState<{ x: number; y: number }[]>([]);
    const contentSvc = useContentService();

    useEventListen(
        () => {
            bump();
        },
        [],
        'refresh_embeddings'
    );

    useEffect(() => {
        const nodes = contentSvc.graph.getNodesByType('content');
        const rnd = Math.floor(Math.random() * nodes.length);
        setSelected(nodes[rnd]);

        const nEmbedding = contentSvc.getContentMetadata(nodes[rnd])?.embedding || [];

        const sims: WeightedNode<ContentNodeId>[] = [];
        nodes.forEach((n, ix) => {
            if (ix === rnd) return;
            const meta = contentSvc.getContentMetadata(n);
            if (meta && meta.embedding) {
                const sim = embeddingSimilarity(nEmbedding, meta.embedding);
                sims.push({ id: n, weight: sim });
            }
        });

        sims.sort((a, b) => b.weight - a.weight);

        // Calc distribution
        const BUCKETS = 30;
        const dist = new Array(BUCKETS).fill(0);
        const min = -1;
        const max = 1;
        const d = max - min;
        sims.forEach((s) => {
            const bucket = Math.floor(((s.weight - min) / d) * (BUCKETS - 1) + 0.5);
            dist[bucket] += 1;
        });

        setDistribution(dist.map((d, ix) => ({ x: Math.floor(((ix / BUCKETS) * 2 - 1) * 10), y: d })));

        setSimilar(sims.slice(0, 8));
    }, [count, contentSvc]);

    return (
        <div className={style.row}>
            <ImageGrid images={[selected || 'content:none', ...similar.map((s) => s.id)]} />
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
