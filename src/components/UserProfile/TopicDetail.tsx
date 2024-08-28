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
    size?: number;
}

export default function TopicDetail({ data, size = 200 }: Props) {
    const [wcSize, setWCSize] = useState(size);
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
                    height={`${size}px`}
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <ImageCloud
                        content={data.images.slice(0, 10)}
                        size={size}
                        onSize={doResize}
                    />
                </svg>
            </div>
        </Card>
    );
}
