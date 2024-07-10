import { Button } from '@knicos/genai-base';
import { useEffect, useMemo, useState } from 'react';
import style from './style.module.css';
import AutoEncoder from '@genaism/services/content/autoencoder';
import { Slider } from '@mui/material';
import { getContentMetadata } from '@genaism/services/content/content';
import { getNodesByType } from '@genaism/services/graph/nodes';

export default function MappingTool() {
    const [startTraining, setStartTraining] = useState(false);
    const [loss, setLoss] = useState(0);
    const [valLoss, setValLoss] = useState(0);
    const [epochs, setEpochs] = useState(100);
    const [epochCount, setEpochCount] = useState(0);
    const [dims] = useState(2);
    const [encoder, setEncoder] = useState<AutoEncoder>();
    const [startGenerate, setStartGenerate] = useState(false);
    const [points, setPoints] = useState<[number, number][]>([]);

    useEffect(() => {
        if (startGenerate) {
            if (encoder) {
                //const raw = getRawEmbeddings();
                const embeddings = encoder.generate(
                    getNodesByType('content').map((n) => getContentMetadata(n)?.embedding || [])
                );
                /*Array.from(raw.keys()).forEach((k, ix) => {
                    const meta = getContentMetadata(k);
                    if (meta) {
                        meta.point = embeddings[ix] as [number, number];
                    }
                });*/

                const points = embeddings.map((e) => ({
                    x: e[0],
                    y: e[1],
                    d: 0,
                }));
                const avgX = points.reduce((s, v) => s + v.x, 0) / points.length;
                const avgY = points.reduce((s, v) => s + v.y, 0) / points.length;
                points.forEach((p) => {
                    p.d = Math.abs(p.x - avgX + (p.y - avgY));
                });
                points.sort((a, b) => a.d - b.d);
                console.log(points);

                setStartGenerate(false);
                setPoints(embeddings as [number, number][]);
            }
        }
    }, [startGenerate, encoder]);

    useEffect(() => {
        const e = new AutoEncoder(dims, 20);
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
                encoder
                    .train(
                        getNodesByType('content').map((n) => getContentMetadata(n)?.embedding || []),
                        epochs,
                        (_, logs) => {
                            if (logs) {
                                setLoss(logs.loss);
                                setValLoss(logs.val_loss);
                                setEpochCount((o) => o + 1);
                            }
                        }
                    )
                    .then((h) => {
                        console.log('H', h);
                        setStartTraining(false);
                    });
            }
        }
    }, [startTraining, encoder, epochs]);

    const boundary = useMemo(() => {
        if (points.length === 0) {
            return {
                minX: 0,
                maxX: 0,
                minY: 0,
                maxY: 0,
            };
        }
        const xs = points.map((p) => p[0]);
        const ys = points.map((p) => p[1]);
        return {
            minX: Math.min(...xs),
            maxX: Math.max(...xs),
            minY: Math.min(...ys),
            maxY: Math.max(...ys),
        };
    }, [points]);

    const dx = boundary.maxX - boundary.minX;
    const dy = boundary.maxY - boundary.minY;

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
                {points.map((p, ix) => (
                    <circle
                        key={ix}
                        r="5"
                        fill="blue"
                        cx={((p[0] - boundary.minX) / dx) * 300}
                        cy={((p[1] - boundary.minY) / dy) * 300}
                    />
                ))}
            </svg>
        </div>
    );
}
