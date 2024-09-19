import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { LineChart } from '@mui/x-charts/LineChart';

export interface TrainingDataPoint {
    epoch: number;
    loss: number;
    validationLoss: number;
    [name: string]: number;
}

interface Props {
    data: TrainingDataPoint[];
    maxEpochs?: number;
}

export default function TrainingGraph({ data, maxEpochs }: Props) {
    const { t } = useTranslation();

    const epoch = data.length > 0 ? data[data.length - 1].epoch : 0;
    const loss = data.length > 0 ? data[data.length - 1].loss : 0;
    const valLoss = data.length > 0 ? data[data.length - 1].validationLoss : 0;
    const max = maxEpochs || data.length + 10;

    return (
        <div>
            <table className={style.statsTable}>
                <tbody>
                    <tr>
                        <td className={style.heading}>{t('creator.labels.epochs')}</td>
                        <td> {epoch}</td>
                    </tr>
                    <tr>
                        <td className={style.heading}>{t('creator.labels.loss')}</td>
                        <td> {loss.toFixed(3)}</td>
                    </tr>
                    <tr>
                        <td className={style.heading}>{t('creator.labels.validationLoss')}</td>
                        <td> {valLoss.toFixed(3)}</td>
                    </tr>
                </tbody>
            </table>
            <LineChart
                margin={{ left: 40, right: 20, top: 20, bottom: 30 }}
                skipAnimation
                height={250}
                dataset={data}
                xAxis={[
                    {
                        dataKey: 'epoch',
                        min: 0,
                        max,
                    },
                ]}
                series={[
                    /*{
                        dataKey: 'loss',
                        showMark: false,
                    },*/
                    {
                        dataKey: 'validationLoss',
                        showMark: false,
                    },
                ]}
            />
        </div>
    );
}
