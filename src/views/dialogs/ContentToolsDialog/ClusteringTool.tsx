import { Button } from '@genaism/components/Button/Button';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getContentData, getContentMetadata } from '@genaism/services/content/content';
import { clusterEmbeddings } from '@genaism/util/embedding';
import { Slider } from '@mui/material';

export default function ClusteringTool() {
    const [startCluster, setStartCluster] = useState(false);
    const [clusters, setClusters] = useState<ContentNodeId[][]>([]);
    const [maxDistance, setMaxDistance] = useState(0.3);
    const [minClusters, setMinClusters] = useState(2);
    const [minSize, setMinSize] = useState(5);

    useEffect(() => {
        if (startCluster) {
            const nodes = getNodesByType('content');
            const embeddings = nodes.map((n) => {
                const meta = getContentMetadata(n);
                return meta?.embedding || [];
            });

            const newClusters = clusterEmbeddings(embeddings, { maxDistance, k: minClusters, minClusterSize: minSize });
            console.log(newClusters);
            setClusters(newClusters.map((c) => c.map((n) => nodes[n])));
            setStartCluster(false);
        }
    }, [startCluster, maxDistance, minClusters, minSize]);

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
                                src={getContentData(n)}
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
