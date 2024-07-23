import { Button } from '@knicos/genai-base';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import AutoEncoder from '@genaism/services/content/autoencoder';
import { Slider } from '@mui/material';
import { getContentMetadata } from '@genaism/services/content/content';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
import HierarchicalEmbeddingCluster from '@genaism/util/embeddings/clustering';
import { normalise } from '@genaism/util/embedding';
import { findNearestSlot } from '@genaism/components/Heatmap/grid';

const CLUSTERS = 5;
const COLORS = ['blue', 'pink', 'green', 'red', 'purple', 'silver'];

function makeFeatures(nodes: ContentNodeId[]) {
    const inputEmbeddings = nodes.map((n) => ({ id: n, embedding: getContentMetadata(n)?.embedding || [] }));

    const clusterer = new HierarchicalEmbeddingCluster({ k: CLUSTERS });
    clusterer.calculate(inputEmbeddings);

    const clusterFeatures = clusterer.createFeatureVectors();
    const features = nodes.map((_, ix) => {
        const f = clusterFeatures[ix];
        return normalise([...inputEmbeddings.map((e) => e.embedding)[ix], ...f]);
    });

    const clusters = clusterer.getClusters();
    const mappedClusters = new Map<ContentNodeId, number>();
    clusters.forEach((c, i) => {
        c.forEach((m) => {
            mappedClusters.set(nodes[m], i);
        });
    });

    return { features, clusters: mappedClusters };
}

interface Point {
    x: number;
    y: number;
    d: number;
    cluster: number;
    id: ContentNodeId;
}

export function rectify(images: Point[], dim: number) {
    const start = performance.now();
    const grid: (Point | null)[][] = new Array(dim);
    for (let i = 0; i < dim; ++i) {
        const row = new Array<Point | null>(dim);
        row.fill(null);
        grid[i] = row;
    }

    images.forEach((image) => {
        const pt: [number, number] = [Math.floor(image.x * dim), Math.floor(image.y * dim)];
        const nearest = findNearestSlot(grid, pt, 100);
        if (nearest[0] >= 0) {
            grid[nearest[1]][nearest[0]] = image;
            image.x = nearest[0] / dim;
            image.y = nearest[1] / dim;
        } else {
            image.x = -1;
            image.y = -1;
        }
    });

    const end = performance.now();
    console.log('Grid time', end - start);

    return images;
}

export default function MappingTool() {
    const [startTraining, setStartTraining] = useState(false);
    const [loss, setLoss] = useState(0);
    const [valLoss, setValLoss] = useState(0);
    const [epochs, setEpochs] = useState(100);
    const [epochCount, setEpochCount] = useState(0);
    const [dims] = useState(2);
    const [encoder, setEncoder] = useState<AutoEncoder>();
    const [startGenerate, setStartGenerate] = useState(false);
    const [points, setPoints] = useState<Point[]>([]);

    useEffect(() => {
        if (startGenerate) {
            if (encoder) {
                const nodes = getNodesByType('content');
                const { features, clusters } = makeFeatures(nodes);

                const embeddings = encoder.generate(features);

                const points = embeddings.map((e, ix) => ({
                    x: e[0],
                    y: e[1],
                    d: 0,
                    id: nodes[ix],
                    cluster: clusters.get(nodes[ix]) || 0,
                }));

                const avgX = points.reduce((s, v) => s + v.x, 0) / points.length;
                const avgY = points.reduce((s, v) => s + v.y, 0) / points.length;
                const minX = points.reduce((s, v) => Math.min(s, v.x), 100);
                const minY = points.reduce((s, v) => Math.min(s, v.y), 100);
                const maxX = points.reduce((s, v) => Math.max(s, v.x), -100);
                const maxY = points.reduce((s, v) => Math.max(s, v.y), -100);
                points.forEach((p) => {
                    p.d = Math.abs(p.x - avgX + (p.y - avgY));
                    p.x = Math.max(0, Math.min(1, (p.x - minX) / (maxX - minX)));
                    p.y = Math.max(0, Math.min(1, (p.y - minY) / (maxY - minY)));
                });
                points.sort((a, b) => a.d - b.d);
                points.forEach((p) => {
                    const meta = getContentMetadata(p.id);
                    if (meta) {
                        meta.point = [p.x, p.y];
                    }
                });

                setStartGenerate(false);
                setPoints(points);
            }
        }
    }, [startGenerate, encoder]);

    useEffect(() => {
        const e = new AutoEncoder(dims, 20 + CLUSTERS, [8]);
        setEncoder(e);
        setEpochCount(0);
        setLoss(0);
        setValLoss(0);
        return () => {
            e.dispose();
        };
    }, [dims]);

    useEffect(() => {
        if (startTraining) {
            if (encoder) {
                const { features } = makeFeatures(getNodesByType('content'));
                encoder
                    .train(features, epochs, (_, logs) => {
                        if (logs) {
                            setLoss(logs.loss);
                            setValLoss(logs.val_loss);
                            setEpochCount((o) => o + 1);
                        }
                    })
                    .then(() => {
                        setStartTraining(false);
                    });
            }
        }
    }, [startTraining, encoder, epochs]);

    return (
        <div className={style.toolContainer}>
            <div className={style.group}>
                <label id="autoencoder-epoch-slider">Epochs</label>
                <Slider
                    aria-labelledby="autoencoder-epoch-slider"
                    value={epochs}
                    onChange={(_, value) => {
                        setEpochs(value as number);
                    }}
                    min={0}
                    max={10000}
                    step={20}
                    valueLabelDisplay="auto"
                />
            </div>
            <Button
                variant="outlined"
                disabled={startTraining}
                onClick={() => setStartTraining(true)}
            >
                Train Encoder
            </Button>
            <div className={style.group}>
                <div>Epochs: {epochCount}</div>
                <div>Loss: {loss.toFixed(3)}</div>
                <div>Validation Loss: {valLoss.toFixed(3)}</div>
            </div>
            <Button
                variant="outlined"
                disabled={startGenerate}
                onClick={() => setStartGenerate(true)}
            >
                Generate Points
            </Button>
            <svg
                width={300}
                height={300}
                viewBox="0 0 300 300"
            >
                {points.map(
                    (p, ix) =>
                        p.x >= 0 && (
                            <circle
                                key={ix}
                                r="5"
                                fill={COLORS[p.cluster] || 'black'}
                                cx={p.x * 300}
                                cy={p.y * 300}
                            />
                        )
                )}
            </svg>
        </div>
    );
}
