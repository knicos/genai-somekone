import { Button } from '@knicos/genai-base';
import { ContentNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { useEffect, useReducer, useState } from 'react';
import { getNodesByType } from '@genaism/services/graph/nodes';
import { getContentData, getContentMetadata } from '@genaism/services/content/content';
import { embeddingSimilarity } from '@genaism/util/embedding';

export default function SimilarityChecker() {
    const [count, bump] = useReducer((o) => o + 1, 0);
    const [selected, setSelected] = useState<ContentNodeId>();
    const [similar, setSimilar] = useState<WeightedNode<ContentNodeId>[]>([]);

    useEffect(() => {
        const nodes = getNodesByType('content');
        const rnd = Math.floor(Math.random() * nodes.length);
        setSelected(nodes[rnd]);

        const nEmbedding = getContentMetadata(nodes[rnd])?.embedding || [];

        const sims: WeightedNode<ContentNodeId>[] = [];
        nodes.forEach((n, ix) => {
            if (ix === rnd) return;
            const meta = getContentMetadata(n);
            if (meta && meta.embedding) {
                const sim = embeddingSimilarity(nEmbedding, meta.embedding);
                sims.push({ id: n, weight: sim });
            }
        });

        sims.sort((a, b) => b.weight - a.weight);
        console.log(sims);
        setSimilar(sims.slice(0, 10));
    }, [count]);

    return (
        <div className={style.toolContainer}>
            <Button onClick={bump}>Refresh</Button>
            <div className={style.row}>
                <img
                    src={getContentData(selected || 'content:none')}
                    width={64}
                    height={64}
                />
                {similar.map((s, ix) => (
                    <img
                        key={ix}
                        src={getContentData(s.id)}
                        width={64}
                        height={64}
                    />
                ))}
            </div>
        </div>
    );
}
