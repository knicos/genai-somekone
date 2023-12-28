import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { weightKeys } from '@genaism/services/profiler/profiler';
import { getNodeData } from '@genaism/services/graph/nodes';
import { getContentData } from '@genaism/services/content/content';
import PieScore from '../PieScore/PieScore';
import style from './style.module.css';
import ScorePie from './ScorePie';

interface UserData {
    name: string;
}

function generateCandidateMessage(item: ScoredRecommendation, t: TFunction) {
    let part1: string;

    switch (item.candidateOrigin) {
        case 'topic_affinity':
            part1 = t('recommendations.labels.topicCandidate', { topic: item.topic || '' });
            break;
        case 'random':
            part1 = t('recommendations.labels.random');
            break;
        case 'coengagement':
            part1 = t('recommendations.labels.coengagedCandidate');
            break;
        case 'similar_user':
            part1 = t('recommendations.labels.similarUserCandidate', {
                userName: item.similarUser ? getNodeData<UserData>(item.similarUser)?.name || '' : '',
            });
            break;
        default:
            part1 = '';
    }
    return part1;
}

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

export default function Item({ item }: Props) {
    const { t } = useTranslation();

    return (
        <li
            className={style.item}
            data-testid="log-row"
        >
            <div className={style.header}>
                <img
                    src={getContentData(item.contentId)}
                    alt="Content item"
                    width={75}
                    height={75}
                />
                <div className={style.message}>{generateCandidateMessage(item, t)}</div>
                <PieScore value={item.rankScore} />
            </div>
            {item.engagedItem && (
                <div className={style.contentColoured}>
                    {t('recommendations.labels.engagedWith')}
                    <img
                        src={getContentData(item.engagedItem)}
                        width={50}
                        height={50}
                        alt="engaged item"
                    />
                </div>
            )}
            <div className={style.content}>{generateScoreMessage(item, t)}</div>
            <div className={style.content}>
                <ScorePie item={item} />
            </div>
        </li>
    );
}
