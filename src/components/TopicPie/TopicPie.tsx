import { PieChart } from '@mui/x-charts';
import { TopicSummaryItem } from '../UserProfile/topicSummary';
import style from './style.module.css';
import gcolours from '@genaism/style/graphColours.json';
import Card from '../DataCard/Card';

interface Props {
    title: string;
    summary: TopicSummaryItem[];
    percent: number;
}

export default function TopicPie({ summary, title, percent }: Props) {
    const data = summary.slice(0, 5).map((s, ix) => ({ id: ix, label: s.label, value: s.percent }));
    data.sort((a, b) => b.value - a.value);
    return summary.length > 0 ? (
        <Card
            title={title}
            score={percent}
        >
            <div className={style.chart}>
                <PieChart
                    series={[
                        {
                            outerRadius: 70,
                            paddingAngle: 5,
                            cornerRadius: 4,
                            innerRadius: 5,
                            cx: 70,
                            cy: 90,
                            data,
                        },
                    ]}
                    colors={gcolours}
                    width={340}
                    height={190}
                />
            </div>
        </Card>
    ) : null;
}
