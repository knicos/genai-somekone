import { Button } from '@knicos/genai-base';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { Slider } from '@mui/material';
import { clusterEmbeddings, ContentNodeId } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';

export default function ClusteringTool() {
    const [startCluster, setStartCluster] = useState(false);
    const [clusters, setClusters] = useState<ContentNodeId[][]>([]);
    const [maxDistance, setMaxDistance] = useState(0.3);
    const [minClusters, setMinClusters] = useState(2);
    const [minSize, setMinSize] = useState(5);
    const contentSvc = useContentService();

    useEffect(() => {
        if (startCluster) {
            const nodes = contentSvc.graph.getNodesByType('content');
            const embeddings = nodes.map((n) => {
                const meta = contentSvc.getContentMetadata(n);
                return { id: n, embedding: meta?.embedding || [] };
            });

            const newClusters = clusterEmbeddings(embeddings, { maxDistance, k: minClusters, minClusterSize: minSize });
            console.log(newClusters);
            setClusters(newClusters.map((c) => c.map((n) => nodes[n])));
            setStartCluster(false);
        }
    }, [startCluster, maxDistance, minClusters, minSize, contentSvc]);

    return (
        <div className={style.toolContainer}>
            <div className={style.group}>
                <label id="autoencoder-epoch-slider">Max member distance</label>
                <Slider
                    aria-labelledby="autoencoder-epoch-slider"
                    value={maxDistance}
                    onChange={(_, value) => {
                        setMaxDistance(value as number);
                    }}
                    min={0}
                    max={1}
                    step={0.01}
                    valueLabelDisplay="auto"
                />
            </div>
            <div className={style.group}>
                <label id="autoencoder-epoch-slider">Min clusters</label>
                <Slider
                    aria-labelledby="autoencoder-epoch-slider"
                    value={minClusters}
                    onChange={(_, value) => {
                        setMinClusters(value as number);
                    }}
                    min={2}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </div>
            <div className={style.group}>
                <label id="autoencoder-epoch-slider">Min cluster size</label>
                <Slider
                    aria-labelledby="autoencoder-epoch-slider"
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
            <Button
                variant="outlined"
                onClick={() => setStartCluster(true)}
            >
                Cluster
            </Button>
            {clusters.map((cluster, ix) => (
                <div
                    key={ix}
                    className={style.group}
                >
                    <div>Cluster {ix}</div>
                    <div className={style.row}>
                        {cluster.map((n) => (
                            <img
                                key={n}
                                src={contentSvc.getContentData(n)}
                                width={32}
                                height={32}
                            />
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
}
