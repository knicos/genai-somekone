import { ContentNodeId, UserNodeId, WeightedNode } from '@genaism/services/graph/graphTypes';
import Card from '../DataCard/Card';
import style from './style.module.css';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useState } from 'react';

interface Props {
    id: UserNodeId;
    topic: string;
    score: number;
    topicContent: Map<string, WeightedNode<ContentNodeId>[]>;
    maxEngage: number;
}

export default function TopicDetail({ topic, score, topicContent }: Props) {
    const [wcSize, setWCSize] = useState(200);
    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);
    const content = topicContent.get(topic) || [];

    return (
        <Card
            message={`#${topic}`}
            score={score}
            image={content[0]?.id}
        >
            <div
                className={style.topicContainer}
                data-testid={`topic-detail-${topic}`}
            >
                <svg
                    width="100%"
                    height="200px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <ImageCloud
                        content={content.slice(0, 10)}
                        size={200}
                        onSize={doResize}
                    />
                </svg>
            </div>
        </Card>
    );
}
