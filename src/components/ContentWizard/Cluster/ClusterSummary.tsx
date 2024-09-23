import StatsTable from '@genaism/components/TrainingGraph/StatsTable';
import { useContentService } from '@genaism/hooks/services';
import { ContentNodeId, Embedding, maxEmbeddingDistance } from '@knicos/genai-recom';
import { BarChart } from '@mui/x-charts';
import { useMemo } from 'react';

interface Props {
    clusters: ContentNodeId[][];
}

export default function ClusterSummary({ clusters }: Props) {
    const contentSvc = useContentService();

    const dataset = useMemo(() => {
        return clusters.map((cluster, ix) => {
            const embeddings: Embedding[] = cluster.map((img) => contentSvc.getContentMetadata(img)?.embedding || []);
            return {
                distance: maxEmbeddingDistance(embeddings, embeddings),
                size: cluster.length,
                id: `cluster-${ix}`,
            };
        });
    }, [clusters, contentSvc]);

    const maxDist = dataset.reduce((m, d) => Math.max(m, d.distance), 0);

    return (
        <div style={{ width: '100%', padding: '1rem', boxSizing: 'border-box' }}>
            <StatsTable
                stats={{
                    'Maximum Distance': maxDist.toFixed(2),
                    'Number of Clusters': `${clusters.length}`,
                }}
            />
            <BarChart
                series={[{ dataKey: 'size' }]}
                dataset={dataset}
                height={150}
                margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
            />
        </div>
    );
}
