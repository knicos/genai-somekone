import { BusyButton } from '@genai-fi/base';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import { Slider } from '@mui/material';
import { findNearestSlot } from '@genaism/services/map/grid';
import { AutoEncoder, ContentNodeId, ContentService, Embedding } from '@genai-fi/recom';
import { useContentService } from '@genaism/hooks/services';
import { Widget } from '@genaism/common/components/WorkflowLayout/Widget';
import { useTranslation } from 'react-i18next';
import TrainingGraph, { TrainingDataPoint } from '../../visualisations/TrainingGraph/TrainingGraph';
import { hslToHex } from '@genaism/util/colours';
import { useAtomValue } from 'jotai';
import { settingContentWizardAdvanced } from '@genaism/apps/Dashboard/state/settingsState';

// const CLUSTERS = 6;
// const COLORS = ['blue', 'pink', 'green', 'red', 'purple', 'silver', 'orange', 'black', 'yellow'];

function makeFeatures(contentSvc: ContentService, nodes: ContentNodeId[]) {
    let embeddingSize = 0;
    let clusterCount = 0;

    nodes.forEach((n) => {
        const meta = contentSvc.getContentMetadata(n);
        if (meta) {
            if (meta.embedding) {
                embeddingSize = Math.max(embeddingSize, meta.embedding.length);
            }
            if (meta.cluster !== undefined) {
                clusterCount = Math.max(clusterCount, meta.cluster + 1);
            }
        }
    });

    const mappedClusters = new Map<ContentNodeId, number>();
    const inputEmbeddings = nodes.map((n) => {
        const meta = contentSvc.getContentMetadata(n);
        if (meta) {
            const cluster = meta?.cluster || clusterCount + 1;
            mappedClusters.set(n, cluster);
            const embedding: Embedding = meta.embedding || new Array<number>(embeddingSize).fill(0);
            const f = new Array<number>(clusterCount).fill(0).map((_, i) => (cluster === i ? 1 : 0));
            return [...embedding, ...f];
        }
        return [...new Array(embeddingSize).fill(0), ...new Array(clusterCount).fill(0)];
    });

    return { features: inputEmbeddings, clusters: mappedClusters, numberOfClusters: clusterCount };
}

interface Point {
    x: number;
    y: number;
    d: number;
    cluster: number;
    id: ContentNodeId;
    colour: string;
}

export function rectify(images: Point[], dim: number) {
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

    return images;
}

export default function MappingTool() {
    const { t } = useTranslation();
    const [startTraining, setStartTraining] = useState(false);
    const [epochs, setEpochs] = useState(30);
    const [dims] = useState(2);
    const [learningRate, setLearningRate] = useState(0.001);
    const [encoder, setEncoder] = useState<AutoEncoder>();
    const [startGenerate, setStartGenerate] = useState(false);
    const [points, setPoints] = useState<Point[]>([]);
    const contentSvc = useContentService();
    const [history, setHistory] = useState<TrainingDataPoint[]>([]);
    const advanced = useAtomValue(settingContentWizardAdvanced);

    useEffect(() => {
        const nodes = contentSvc.graph.getNodesByType('content');
        const points: Point[] = nodes.map((n) => {
            const meta = contentSvc.getContentMetadata(n);
            const p = meta?.point;
            return { x: p?.[0] || 0, y: p?.[1] || 0, d: 0, id: n, cluster: meta?.cluster || 0, colour: 'black' };
        });
        setPoints(points);
    }, [contentSvc]);

    useEffect(() => {
        if (startGenerate) {
            if (encoder) {
                const nodes = contentSvc.graph.getNodesByType('content');
                const { features, clusters, numberOfClusters } = makeFeatures(contentSvc, nodes);

                const embeddings = encoder.generate(features);

                const points = embeddings.map((e, ix) => ({
                    x: e[0],
                    y: e[1],
                    d: 0,
                    id: nodes[ix],
                    cluster: clusters.get(nodes[ix]) || 0,
                    colour: hslToHex(((clusters.get(nodes[ix]) || 0) / numberOfClusters) * 360, 100, 50),
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
            const inSize = features[0].length || 20;
            e.create(dims, inSize, {
                noRegularization: true,
                outputActivation: 'linear',
                learningRate,
                loss: 'cosineProximity',
                layers: [16],
            });
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
    }, [startTraining, epochs, contentSvc, dims, learningRate]);

    return (
        <div
            className={style.widgetColumn}
            data-widget="container"
        >
            <Widget
                title={t('creator.titles.points')}
                dataWidget="points"
                style={{ maxWidth: '360px' }}
            >
                <svg
                    width={300}
                    height={300}
                    viewBox="0 0 300 300"
                    className={style.pointSvg}
                >
                    {points.map(
                        (p, ix) =>
                            p.x >= 0 && (
                                <circle
                                    key={ix}
                                    r="2"
                                    fill={p.colour}
                                    cx={p.x * 300}
                                    cy={p.y * 300}
                                />
                            )
                    )}
                </svg>
            </Widget>
            <Widget
                title={t('creator.titles.mapping')}
                dataWidget="mapping"
                style={{ width: '300px' }}
            >
                {advanced && (
                    <div className={style.group}>
                        <label id="autoencoder-epoch-slider">{t('creator.labels.epochs')}</label>
                        <Slider
                            disabled={startTraining}
                            aria-labelledby="autoencoder-epoch-slider"
                            value={epochs}
                            onChange={(_, value) => {
                                setEpochs(value as number);
                            }}
                            min={10}
                            max={200}
                            step={10}
                            valueLabelDisplay="auto"
                        />
                        <label id="autoencoder-rate-slider">{t('creator.labels.learningRate')}</label>
                        <Slider
                            disabled={startTraining}
                            aria-labelledby="autoencoder-rate-slider"
                            value={learningRate}
                            onChange={(_, value) => {
                                setLearningRate(value as number);
                            }}
                            min={0.0001}
                            max={0.002}
                            step={0.0001}
                            valueLabelDisplay="auto"
                        />
                    </div>
                )}
                <div className={style.group}>
                    <BusyButton
                        variant="contained"
                        busy={startTraining}
                        onClick={() => setStartTraining(true)}
                    >
                        {t('creator.actions.train')}
                    </BusyButton>
                </div>
            </Widget>
            {advanced && (
                <Widget
                    title={t('creator.titles.mapTraining')}
                    dataWidget="points"
                    style={{ width: '300px' }}
                >
                    <div className={style.group}>
                        <TrainingGraph
                            data={history}
                            maxEpochs={epochs}
                        />
                    </div>
                </Widget>
            )}
        </div>
    );
}
