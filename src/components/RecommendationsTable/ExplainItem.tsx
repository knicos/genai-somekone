import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScoredRecommendation, Scores } from '@genaism/services/recommender/recommenderTypes';
import ScorePie from './ScorePie';
import style from './style.module.css';
import gColors from '../../style/graphColours.json';
import LightbulbIcon from '@mui/icons-material/Lightbulb';

const SCORE_SCALE = 20;
const MIN_SCORE_SIZE = 60;

function generateScoreMessage(item: ScoredRecommendation, t: TFunction) {
    const keys = Object.keys(item.significance) as (keyof Scores)[];
    const maxComponent = keys.reduce(
        (cmax, k, ix) => ((item.significance[k] || -1000) > (item.significance[keys[cmax]] || 0) ? ix : cmax),
        -1000
    );
    const value = item.significance[keys[maxComponent]] || -1000;
    const key = value > -1000 ? keys[maxComponent] : 'noReason';
    const part2 = t(`recommendations.labels.${key}`);

    return part2;
}

interface Props {
    item: ScoredRecommendation;
}

const SCORE_KEYS: (keyof Scores)[] = ['taste', 'coengagement', 'viewing'];

export default function ExplainItem({ item }: Props) {
    const { t } = useTranslation();

    const significance = SCORE_KEYS.map((k) => item.scores[k] || -1000);
    const sigMax = Math.max(...significance);
    const sigMin = Math.min(...significance);
    const sigDiff = sigMax - sigMin;

    return (
        <li data-testid="explain-item">
            <div className={style.listIcon}>
                <LightbulbIcon fontSize="large" />
            </div>
            <div className={style.listColumn}>
                {generateScoreMessage(item, t)}
                <div className={style.scoreList}>
                    {SCORE_KEYS.map((k, ix) => (
                        <ScorePie
                            value={item.features[k] || 0}
                            key={k}
                            maxValue={1}
                            label={t(`recommendations.features.${k}`)}
                            showValue
                            color={gColors[ix % gColors.length]}
                            size={
                                sigDiff > 0
                                    ? ((significance[ix] - sigMin) / sigDiff) * SCORE_SCALE + MIN_SCORE_SIZE
                                    : MIN_SCORE_SIZE + SCORE_SCALE / 2
                            }
                        />
                    ))}
                </div>
            </div>
        </li>
    );
}
