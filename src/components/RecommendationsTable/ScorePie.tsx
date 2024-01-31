import { PieChart } from '@mui/x-charts';
import style from './style.module.css';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { weightKeys } from '@genaism/services/profiler/profiler';
import { useTranslation } from 'react-i18next';
import gcolours from '@genaism/style/graphColours.json';

interface Props {
    item: ScoredRecommendation;
}

export default function ScorePie({ item }: Props) {
    const { t } = useTranslation();
    const selectedScores: number[] = [];
    if (item.significance) {
        item.significance.forEach((s, ix) => {
            if (s > 0) selectedScores.push(ix);
        });
        selectedScores.sort((a, b) => (item.significance ? item.significance[b] - item.significance[a] : 0));
    }

    return selectedScores.length > 1 ? (
        <div className={style.chart}>
            <PieChart
                series={[
                    {
                        outerRadius: 50,
                        paddingAngle: 5,
                        cornerRadius: 4,
                        innerRadius: 5,
                        cx: 50,
                        cy: 50,
                        data: selectedScores.slice(0, 3).map((s, ix) => ({
                            id: ix,
                            label: t(`recommendations.features.${weightKeys[s]}`),
                            value: item.significance?.[s] || 0,
                        })),
                    },
                ]}
                colors={gcolours}
                height={120}
            />
        </div>
    ) : null;
}
