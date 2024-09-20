import { Button } from '@knicos/genai-base';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import { clusterEmbeddings, ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import ContentCluster from './ContentCluster';
import { useTranslation } from 'react-i18next';
import { Widget } from './Widget';

export default function ContentClustering() {
    const { t } = useTranslation();
    const [startCluster, setStartCluster] = useState(false);
    const [clusters, setClusters] = useState<ContentNodeId[][]>([]);
    const [maxDistance, setMaxDistance] = useState(2);
    const [minClusters, setMinClusters] = useState(2);
    const [minSize, setMinSize] = useState(200);
    const contentSvc = useContentService();

    useEffect(() => {
        if (startCluster) {
            const nodes = contentSvc.graph.getNodesByType('content');
            const embeddings = nodes.map((n) => {
                const meta = contentSvc.getContentMetadata(n);
                return { id: n, embedding: meta?.embedding || [] };
            });

            const newClusters = clusterEmbeddings(embeddings, { maxDistance, k: minClusters, minClusterSize: minSize });
            // Update content cluster metadata
            newClusters.forEach((cluster, i) => {
                cluster.forEach((n) => {
                    const node = nodes[n];
                    const meta = contentSvc.getContentMetadata(node);
                    if (meta) {
                        meta.cluster = i;
                    }
                });
            });
            setClusters(newClusters.map((c) => c.map((n) => nodes[n])));
            setStartCluster(false);
        }
    }, [startCluster, maxDistance, minClusters, minSize, contentSvc]);

    return (
        <>
            <div
                className={style.widgetColumn}
                data-widget="container"
            >
                <Widget
                    title={t('creator.titles.cluster')}
                    dataWidget="cluster"
                    style={{ maxWidth: '300px' }}
                >
                    <div className={style.group}>
                        <label id="autoencoder-memberdist-slider">{t('creator.labels.maxMemberDist')}</label>
                        <Slider
                            aria-labelledby="autoencoder-memberdist-slider"
                            value={maxDistance}
                            onChange={(_, value) => {
                                setMaxDistance(value as number);
                            }}
                            min={0}
                            max={2}
                            step={0.05}
                            valueLabelDisplay="auto"
                        />
                        <label id="autoencoder-mincluster-slider">{t('creator.labels.minClusters')}</label>
                        <Slider
                            aria-labelledby="autoencoder-mincluster-slider"
                            value={minClusters}
                            onChange={(_, value) => {
                                setMinClusters(value as number);
                            }}
                            min={2}
                            max={100}
                            step={1}
                            valueLabelDisplay="auto"
                        />
                        <label id="autoencoder-minsize-slider">{t('creator.labels.minClusterSize')}</label>
                        <Slider
                            aria-labelledby="autoencoder-minsize-slider"
                            value={minSize}
                            onChange={(_, value) => {
                                setMinSize(value as number);
                            }}
                            min={1}
                            max={200}
                            step={1}
                            valueLabelDisplay="auto"
                        />
                    </div>
                    <div className={style.group}>
                        <Button
                            variant="contained"
                            onClick={() => setStartCluster(true)}
                        >
                            {t('creator.actions.cluster')}
                        </Button>
                    </div>
                </Widget>

                <ContentCluster clusters={clusters} />
            </div>
        </>
    );
}
