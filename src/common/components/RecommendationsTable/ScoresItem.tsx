import { useTranslation } from 'react-i18next';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import ScorePie from './ScorePie';
import style from './style.module.css';
import sColors from '@knicos/genai-base/css/colours.module.css';
import { ScoredRecommendation } from '@knicos/genai-recom';

interface Props {
    item: ScoredRecommendation;
}

export default function ScoresItem({ item }: Props) {
    const { t } = useTranslation();

    return (
        <li data-testid="score-item">
            <div className={style.listIcon}>
                <EmojiEventsIcon fontSize="large" />
                <h2>{t('recommendations.titles.predictedScore')}</h2>
            </div>
            <div
                className={style.listColumn}
                style={{ alignItems: 'center' }}
            >
                <div className={style.scoreList}>
                    <ScorePie
                        value={item.score || 0}
                        maxValue={1}
                        label={t(`recommendations.labels.score`)}
                        showValue
                        color={sColors.secondary}
                        size={100}
                        bgColor={sColors.bgSubdued1}
                    />
                    <ScorePie
                        value={item.diversity || 0}
                        maxValue={1}
                        label={t(`recommendations.labels.diversity`)}
                        showValue
                        color={sColors.primary}
                        size={70}
                        bgColor={sColors.bgSubdued1}
                    />
                </div>
            </div>
        </li>
    );
}
