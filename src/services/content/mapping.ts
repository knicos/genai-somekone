import { Embedding } from '@genaism/util/embedding';
import AutoEncoder from './autoencoder';
import { getNodesByType } from '../graph/nodes';
import { getContentMetadata } from './content';

export interface Point {
    x: number;
    y: number;
}

const EPOCHS = 50;

const encoder = new AutoEncoder(2, 20);

export async function mapEmbeddingToPoint(embedding: Embedding): Promise<Point> {
    if (encoder.isTrained()) {
        const p = encoder.generate([embedding])[0];
        return { x: p[0], y: p[1] };
    } else {
        const nodes = getNodesByType('content');
        const embeddings = nodes.map((n) => getContentMetadata(n)?.embedding || []);
        await encoder.train(embeddings, EPOCHS);
        const p = encoder.generate([embedding])[0];
        return { x: p[0], y: p[1] };
    }
}

export async function mapEmbeddingsToPoints(embeddings: Embedding[]): Promise<Point[]> {
    if (!encoder.isTrained()) {
        // const nodes = getNodesByType('content');
        // const embeddings = nodes.map((n) => getContentMetadata(n)?.embedding || []);
        await encoder.train(embeddings, EPOCHS);
    }

    const ps = encoder.generate(embeddings);
    let maxX = Number.NEGATIVE_INFINITY;
    let minX = Number.POSITIVE_INFINITY;
    let maxY = Number.NEGATIVE_INFINITY;
    let minY = Number.POSITIVE_INFINITY;
    ps.forEach((point) => {
        maxX = Math.max(maxX, point[0]);
        minX = Math.min(minX, point[0]);
        maxY = Math.max(maxY, point[1]);
        minY = Math.min(minY, point[1]);
    });

    const dX = maxX - minX;
    const dY = maxY - minY;

    return ps.map((p) => ({ x: (p[0] - minX) / dX, y: (p[1] - minY) / dY }));
}
