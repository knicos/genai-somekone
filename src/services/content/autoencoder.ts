import * as tf from '@tensorflow/tfjs';

export default class AutoEncoder {
    public model: tf.LayersModel;
    public encoder: tf.layers.Layer;
    public decoder: tf.layers.Layer;
    private trained: boolean = false;
    private trainingPromise?: Promise<tf.History>;

    constructor(dim: number, inDim = 1280) {
        // Now use an autoencoder to reduce it.
        const model = tf.sequential();
        const encoder = tf.layers.dense({
            units: dim,
            batchInputShape: [null, inDim],
            activation: 'relu',
            kernelInitializer: 'randomNormal',
            biasInitializer: 'ones',
        });
        const decoder = tf.layers.dense({ units: inDim, activation: 'relu' });

        model.add(encoder);
        model.add(decoder);
        model.compile({ optimizer: 'sgd', loss: 'meanSquaredError' });
        this.model = model;
        this.encoder = encoder;
        this.decoder = decoder;
    }

    async train(data: number[][], epochs = 1000, onEpochEnd?: (e: number, logs?: tf.Logs) => void) {
        if (!this.trainingPromise) {
            this.trainingPromise = new Promise((resolve) => {
                const xs = tf.tensor2d(data);
                this.model
                    .fit(xs, xs, {
                        epochs,
                        batchSize: 32,
                        shuffle: true,
                        validationSplit: 0.1,
                        callbacks: { onEpochEnd: onEpochEnd },
                    })
                    .then((h) => {
                        xs.dispose();
                        this.trained = true;
                        resolve(h);
                    });
            });
        }
        return await this.trainingPromise;
    }

    isTrained() {
        return this.trained;
    }

    generate(data: number[][]): number[][] {
        const xs = tf.tensor2d(data);
        const result = tf.tidy(() => {
            const predictor = tf.sequential();
            predictor.add(this.encoder);
            const r = predictor.predict(xs);
            return r;
        });

        xs.dispose();

        if (!Array.isArray(result)) {
            return result.arraySync() as number[][];
        } else {
            return [];
        }
    }

    dispose() {
        this.model.dispose();
    }
}
