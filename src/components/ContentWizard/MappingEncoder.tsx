import { Button } from '@knicos/genai-base';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import { Slider } from '@mui/material';
import { findNearestSlot } from '@genaism/components/Heatmap/grid';
import { AutoEncoder, ContentNodeId, ContentService } from '@knicos/genai-recom';
import HierarchicalEmbeddingCluster from '@knicos/genai-recom/utils/embeddings/clustering';
import { useContentService } from '@genaism/hooks/services';
import gColors from '../../style/graphColours.json';
import { Widget } from './Widget';
import { useTranslation } from 'react-i18next';
import TrainingGraph, { TrainingDataPoint } from '../TrainingGraph/TrainingGraph';

const CLUSTERS = 5;
// const COLORS = ['blue', 'pink', 'green', 'red', 'purple', 'silver', 'orange', 'black', 'yellow'];

function makeFeatures(contentSvc: ContentService, nodes: ContentNodeId[]) {
    const inputEmbeddings = nodes.map((n) => ({ id: n, embedding: contentSvc.getContentMetadata(n)?.embedding || [] }));

    const clusterer = new HierarchicalEmbeddingCluster({
        k: CLUSTERS,
        //minClusterSize: Math.floor(0.5 * (inputEmbeddings.length / CLUSTERS)),
    });
    clusterer.calculate(inputEmbeddings);

    //const clusterFeatures = clusterer.createFeatureVectors();
    /*const features = nodes.map((_, ix) => {
        const f = clusterFeatures[ix];
        return normalise([...inputEmbeddings.map((e) => e.embedding)[ix], ...f]);
    });*/
    const features = inputEmbeddings.map((e) => e.embedding);

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
    const { t } = useTranslation();
    const [startTraining, setStartTraining] = useState(false);
    const [epochs, setEpochs] = useState(30);
    const [dims] = useState(2);
    const [encoder, setEncoder] = useState<AutoEncoder>();
    const [startGenerate, setStartGenerate] = useState(false);
    const [points, setPoints] = useState<Point[]>([]);
    const contentSvc = useContentService();
    const [history, setHistory] = useState<TrainingDataPoint[]>([]);

    useEffect(() => {
        if (startGenerate) {
            if (encoder) {
                const nodes = contentSvc.graph.getNodesByType('content');
                const { features, clusters } = makeFeatures(contentSvc, nodes);

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
                    const meta = contentSvc.getContentMetadata(p.id);
                    if (meta) {
                        meta.point = [p.x, p.y];
                    }
                });

                setStartGenerate(false);
                setPoints(points);
            }
        }
    }, [startGenerate, encoder, contentSvc]);

    useEffect(() => {
        if (startTraining) {
            const { features } = makeFeatures(contentSvc, contentSvc.graph.getNodesByType('content'));

            const e = new AutoEncoder();
            e.create(dims, features[0].length || 20, [10]);
            setEncoder((old) => {
                if (old) {
                    try {
                        old.dispose();
                    } catch (e) {
                        console.error(e);
                    }
                }
                return e;
            });
            setHistory([]);

            e.train(features, epochs, (e, logs) => {
                if (logs) {
                    setHistory((old) => [...old, { epoch: e + 1, loss: logs.loss, validationLoss: logs.val_loss }]);
                }
            }).then(() => {
                setStartTraining(false);
                setStartGenerate(true);
            });
        }
    }, [startTraining, epochs, contentSvc, dims]);

    return (
        <div
            className={style.widgetColumn}
            data-widget="container"
        >
            <Widget
                title={t('creator.titles.mapping')}
                dataWidget="mapping"
                style={{ maxWidth: '300px' }}
            >
                <div className={style.group}>
                    <label id="autoencoder-epoch-slider">{t('creator.labels.epochs')}</label>
                    <Slider
                        aria-labelledby="autoencoder-epoch-slider"
                        value={epochs}
                        onChange={(_, value) => {
                            setEpochs(value as number);
                        }}
                        min={4}
                        max={100}
                        step={2}
                        valueLabelDisplay="auto"
                    />
                </div>
                <div className={style.group}>
                    <Button
                        variant="contained"
                        disabled={startTraining}
                        onClick={() => setStartTraining(true)}
                    >
                        {t('creator.actions.train')}
                    </Button>
                </div>
                <div className={style.group}>
                    <TrainingGraph
                        data={history}
                        maxEpochs={epochs}
                    />
                </div>
            </Widget>
            <Widget
                title={t('creator.titles.points')}
                dataWidget="points"
                style={{ maxWidth: '360px' }}
            >
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
                                    fill={gColors[p.cluster % gColors.length] || 'black'}
                                    cx={p.x * 300}
                                    cy={p.y * 300}
                                />
                            )
                    )}
                </svg>
            </Widget>
        </div>
    );
}
