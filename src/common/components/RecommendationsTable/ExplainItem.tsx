//import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import ScorePie from './ScorePie';
import style from './style.module.css';
import gColors from '../../../style/graphColours.json';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import { ScoredRecommendation, Scores } from '@genai-fi/recom';
import sColors from '@genai-fi/base/css/colours.module.css';

const SCORE_SCALE = 20;
const MIN_SCORE_SIZE = 60;

/*function generateScoreMessage(item: ScoredRecommendation, t: TFunction) {
    const keys = Object.keys(item.significance) as (keyof Scores)[];
    const maxComponent = keys.reduce(
        (cmax, k, ix) => ((item.significance[k] || -1000) > (item.significance[keys[cmax]] || 0) ? ix : cmax),
        -1000
    );
    const value = item.significance[keys[maxComponent]] || -1000;
    const key = value > -1000 ? keys[maxComponent] : 'noReason';
    const part2 = t(`recommendations.labels.${key}`);

    return part2;
}*/

interface Props {
    item: ScoredRecommendation;
}

export default function ExplainItem({ item }: Props) {
    const { t } = useTranslation();

    const keys = Object.keys(item.scores) as (keyof Scores)[];
    const significance = keys.map((k) => item.significance[k] || 0);
    const sigMax = Math.max(...significance);
    const sigMin = Math.min(...significance);
    const sigDiff = sigMax - sigMin;
    const scores = keys
        .map((k) => ({
            name: k,
            score: item.features[k] || 0,
            significance: sigDiff > 0 ? ((item.significance[k] || 0) - sigMin) / sigDiff : item.significance[k] || 0,
        }))
        .filter((s) => s.score > 0 && s.significance > 0);
    scores.sort((a, b) => b.significance - a.significance);

    return (
        <li data-testid="explain-item">
            <div className={style.listIcon}>
                <LightbulbIcon fontSize="large" />
                <h2>{t('recommendations.titles.explainScore')}</h2>
            </div>
            <div className={style.listColumn}>
                {scores.map((k, ix) =>
                    k.score > 0 ? (
                        <div
                            key={k.name}
                            className={style.scoreRow}
                        >
                            <ScorePie
                                value={k.score || 0}
                                maxValue={1}
                                showValue
                                color={gColors[ix % gColors.length]}
                                bgColor={sColors.bgSubdued1}
                                size={
                                    sigDiff > 0
                                        ? k.significance * SCORE_SCALE + MIN_SCORE_SIZE
                                        : MIN_SCORE_SIZE + SCORE_SCALE / 2
                                }
                            />
                            <div>{t(`recommendations.features.${k.name}`)}</div>
                        </div>
                    ) : null
                )}
            </div>
        </li>
    );
}
