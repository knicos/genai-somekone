import { useContentService } from '@genaism/hooks/services';
import { ContentNodeId } from '@knicos/genai-recom';
import { BarChart } from '@mui/x-charts';
import { useMemo } from 'react';
import style from '../style.module.css';
import { Pagination } from '@mui/material';

interface Props {
    clusters: ContentNodeId[][];
    page: number;
    onPage: (newPage: number) => void;
}

export default function ClusterTags({ clusters, page, onPage }: Props) {
    const contentSvc = useContentService();

    const dataset = useMemo(() => {
        const cluster = clusters[page];
        const labels = new Map<string, number>();
        cluster.forEach((img) => {
            const meta = contentSvc.getContentMetadata(img);
            if (meta) {
                meta.labels.forEach((label) => {
                    labels.set(label.label, (labels.get(label.label) || 0) + 1);
                });
            }
        });

        const labelArray = Array.from(labels).map((v) => ({
            label: v[0].length > 10 ? `${v[0].slice(0, 10)}...` : v[0],
            count: v[1],
        }));

        labelArray.sort((a, b) => b.count - a.count);
        return labelArray.slice(0, 15);
    }, [clusters, contentSvc, page]);

    return (
        <div className={style.clusterGroup}>
            <Pagination
                count={clusters.length}
                page={page + 1}
                onChange={(_, value) => onPage(value - 1)}
            />
            <BarChart
                layout="horizontal"
                series={[{ dataKey: 'count' }]}
                dataset={dataset}
                yAxis={[{ dataKey: 'label', scaleType: 'band' }]}
                height={300}
                margin={{ left: 100, right: 20, top: 20, bottom: 30 }}
            />
        </div>
    );
}
