import { PieChart } from '@mui/x-charts';

interface Props {
    value: number;
}

export default function PieScore({ value }: Props) {
    return (
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
            colors={['white', '#008297']}
            width={50}
            height={50}
        />
    );
}
