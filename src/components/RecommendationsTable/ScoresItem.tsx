import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { weightKeys } from '@genaism/services/profiler/profiler';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScorePie from './ScorePie';
import style from './style.module.css';
import gColors from '../../style/graphColours.json';

const SCORE_SCALE = 20;
const MIN_SCORE_SIZE = 60;

function generateScoreMessage(item: ScoredRecommendation, t: TFunction) {
    const maxComponent = item.significance
        ? item.significance.reduce((cmax, v, ix) => (v > (item.significance?.[cmax] || 0) ? ix : cmax), 0)
        : item.scores.reduce((cmax, v, ix) => (v > item.scores[cmax] ? ix : cmax), 0);
    const value = item.significance ? item.significance[maxComponent] : item.scores[maxComponent];
    const key = value > 0 ? weightKeys[maxComponent] : 'noReason';
    const part2 = t(`recommendations.labels.${key}`);

    return part2;
}

interface Props {
    item: ScoredRecommendation;
}

export default function ScoresItem({ item }: Props) {
    const { t } = useTranslation();
    const selectedScores: number[] = [];
    if (item.significance) {
        item.significance.forEach((s, ix) => {
            if (s !== 0) selectedScores.push(ix);
        });
        selectedScores.sort((a, b) => (item.significance ? item.significance[b] - item.significance[a] : 0));
    }

    selectedScores.splice(3);

    const sigMax = item.significance ? item.significance[selectedScores[0]] : 0;
    const sigMin = item.significance ? item.significance[selectedScores[selectedScores.length - 1]] : 0;
    const sigDiff = sigMax - sigMin;

    return (
        <li data-testid="score-item">
            <div className={style.listIcon}>
                <EmojiEventsIcon fontSize="large" />
            </div>
            <div className={style.listColumn}>
                {generateScoreMessage(item, t)}
                <div className={style.scoreList}>
                    {selectedScores.map((s) => (
                        <ScorePie
                            value={item.scores[s] || 0}
                            key={s}
                            maxValue={2}
                            label={t(`recommendations.features.${weightKeys[s]}`)}
                            showValue
                            color={gColors[s % gColors.length]}
                            size={
                                item.significance && sigDiff > 0
                                    ? ((item.significance[s] - sigMin) / sigDiff) * SCORE_SCALE + MIN_SCORE_SIZE
                                    : MIN_SCORE_SIZE + SCORE_SCALE / 2
                            }
                        />
                    ))}
                </div>
            </div>
        </li>
    );
}
