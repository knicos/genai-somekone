import RefreshIcon from '@mui/icons-material/Refresh';
import style from './style.module.css';
import { useEffect, useReducer, useState } from 'react';
import { ContentNodeId, embeddingSimilarity, WeightedNode } from '@knicos/genai-recom';
import { useContentService } from '@genaism/hooks/services';
import { IconButton } from '@mui/material';
import ImageGrid from '../ImageGrid/ImageGrid';

export default function SimilarityChecker() {
    const [count, bump] = useReducer((o) => o + 1, 0);
    const [selected, setSelected] = useState<ContentNodeId>();
    const [similar, setSimilar] = useState<WeightedNode<ContentNodeId>[]>([]);
    const contentSvc = useContentService();

    useEffect(() => {
        const nodes = contentSvc.graph.getNodesByType('content');
        const rnd = Math.floor(Math.random() * nodes.length);
        setSelected(nodes[rnd]);

        const nEmbedding = contentSvc.getContentMetadata(nodes[rnd])?.embedding || [];

        const sims: WeightedNode<ContentNodeId>[] = [];
        nodes.forEach((n, ix) => {
            if (ix === rnd) return;
            const meta = contentSvc.getContentMetadata(n);
            if (meta && meta.embedding) {
                const sim = embeddingSimilarity(nEmbedding, meta.embedding);
                sims.push({ id: n, weight: sim });
            }
        });

        sims.sort((a, b) => b.weight - a.weight);
        setSimilar(sims.slice(0, 8));
    }, [count, contentSvc]);

    return (
        <div className={style.row}>
            <IconButton onClick={bump}>
                <RefreshIcon />
            </IconButton>
            <ImageGrid images={[selected || 'content:none', ...similar.map((s) => s.id)]} />
        </div>
    );
}
