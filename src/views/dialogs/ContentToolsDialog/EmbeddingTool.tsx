import { Button } from '@knicos/genai-base';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import AutoEncoder from '@genaism/services/content/autoencoder';
import { getRawEmbeddings } from './RawEmbeddingTool';
import { Slider } from '@mui/material';
import { getContentMetadata } from '@genaism/services/content/content';

export default function EmbeddingTool() {
    const [startTraining, setStartTraining] = useState(false);
    const [loss, setLoss] = useState(0);
    const [valLoss, setValLoss] = useState(0);
    const [epochs, setEpochs] = useState(100);
    const [epochCount, setEpochCount] = useState(0);
    const [dims, setDims] = useState(20);
    const [encoder, setEncoder] = useState<AutoEncoder>();
    const [startGenerate, setStartGenerate] = useState(false);

    useEffect(() => {
        if (startGenerate) {
            if (encoder) {
                const raw = getRawEmbeddings();
                const embeddings = encoder.generate(Array.from(raw.values()));
                Array.from(raw.keys()).forEach((k, ix) => {
                    const meta = getContentMetadata(k);
                    if (meta) {
                        meta.embedding = embeddings[ix];
                    }
                });
                setStartGenerate(false);
            }
        }
    }, [startGenerate, encoder]);

    useEffect(() => {
        const e = new AutoEncoder(dims);
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
                    .train(Array.from(getRawEmbeddings().values()), epochs, (_, logs) => {
                        if (logs) {
                            setLoss(logs.loss);
                            setValLoss(logs.val_loss);
                            setEpochCount((o) => o + 1);
                        }
                    })
                    .then((h) => {
                        console.log('H', h);
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
            <div className={style.group}>
                <label id="autoencoder-dims-slider">Dimensions</label>
                <Slider
                    aria-labelledby="autoencoder-dims-slider"
                    value={dims}
                    onChange={(_, value) => {
                        setDims(value as number);
                    }}
                    min={0}
                    max={100}
                    step={1}
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
                Generate Embeddings
            </Button>
        </div>
    );
}
