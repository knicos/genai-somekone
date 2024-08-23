import Card from '../DataCard/Card';
import style from './style.module.css';
import ImageCloud, { WeightedImage } from '../ImageCloud/ImageCloud';
import { useCallback, useState } from 'react';

export interface TopicData {
    images: WeightedImage[];
    score: number;
    topic: string;
    image?: string;
}

interface Props {
    data: TopicData;
}

export default function TopicDetail({ data }: Props) {
    const [wcSize, setWCSize] = useState(200);
    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <Card
            message={`#${data.topic}`}
            score={data.score}
            image={data.image}
        >
            <div
                className={style.topicContainer}
                data-testid={`topic-detail-${data.topic}`}
            >
                <svg
                    width="100%"
                    height="200px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <ImageCloud
                        content={data.images.slice(0, 10)}
                        size={200}
                        onSize={doResize}
                    />
                </svg>
            </div>
        </Card>
    );
}
