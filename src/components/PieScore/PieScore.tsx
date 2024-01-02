import { PieChart } from '@mui/x-charts';
import style from './style.module.css';

interface Props {
    value: number;
    color?: 'primary' | 'grey';
}

export default function PieScore({ value, color = 'primary' }: Props) {
    return (
        <div
            data-testid="pie-score"
            className={color === 'primary' ? style.chart : style.chartGrey}
        >
            <PieChart
                series={[
                    {
                        outerRadius: 20,
                        cx: 20,
                        cy: 20,
                        data: [
                            { id: 0, value },
                            { id: 1, value: 1 - value },
                        ],
                    },
                ]}
                colors={['white', color === 'primary' ? '#008297' : '#5f7377']}
                width={50}
                height={50}
            />
        </div>
    );
}
