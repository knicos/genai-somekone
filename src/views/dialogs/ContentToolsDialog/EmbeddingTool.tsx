import { Button } from '@knicos/genai-base';
import { useEffect, useState } from 'react';
import style from './style.module.css';
import { Slider } from '@mui/material';
import { useContentService } from '@genaism/hooks/services';

export default function EmbeddingTool() {
    const [loss, setLoss] = useState(0);
    const [valLoss, setValLoss] = useState(0);
    const [epochs, setEpochs] = useState(100);
    const [epochCount, setEpochCount] = useState(0);
    const [dims, setDims] = useState(20);
    const [startGenerate, setStartGenerate] = useState(false);
    const contentSvc = useContentService();

    useEffect(() => {
        if (startGenerate) {
            contentSvc
                .createEncoderModel({
                    epochs,
                    dims,
                    noSave: true,
                    onEpoch: (_, l, v) => {
                        setLoss(l);
                        setValLoss(v);
                        setEpochCount((old) => old + 1);
                    },
                })
                .then(() => {
                    setStartGenerate(false);
                });
        }
    }, [startGenerate, contentSvc, epochs, dims]);

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
