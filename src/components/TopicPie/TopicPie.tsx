import { PieChart } from '@mui/x-charts';
import { TopicSummaryItem } from '../UserProfile/topicSummary';
import style from './style.module.css';

interface Props {
    title: string;
    summary: TopicSummaryItem[];
}

export default function TopicPie({ summary, title }: Props) {
    return summary.length > 0 ? (
        <div className={style.container}>
            <h2>{title}</h2>
            <div className={style.chart}>
                <PieChart
                    series={[
                        {
                            outerRadius: 90,
                            paddingAngle: 5,
                            cornerRadius: 4,
                            innerRadius: 5,
                            cx: 90,
                            cy: 90,
                            data: summary.slice(0, 5).map((s, ix) => ({ id: ix, label: s.label, value: s.percent })),
                        },
                    ]}
                    colors={['#2e6df5', '#19b1a8', '#fad630', '#fd9d32', '#e04f66', '#a77bca', '#c2a251', '#97999b']}
                    width={340}
                    height={190}
                />
            </div>
        </div>
    ) : null;
}
