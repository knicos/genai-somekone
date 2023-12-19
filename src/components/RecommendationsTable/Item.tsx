import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import TableItem from '../Table/TableItem';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { weightKeys } from '@genaism/services/profiler/profiler';

function generateMessage(item: ScoredRecommendation, t: TFunction) {
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
        default:
            part1 = '';
    }

    const maxComponent = item.scores.reduce((cmax, v, ix) => (v > item.scores[cmax] ? ix : cmax), 0);
    const key = weightKeys[maxComponent];
    const part2 = t(`recommendations.labels.${key}`);

    return part1 + ' ' + part2;
}

interface Props {
    item: ScoredRecommendation;
}

export default function Item({ item }: Props) {
    const { t } = useTranslation();

    return (
        <TableItem
            message={generateMessage(item, t)}
            image={item.contentId}
            score={item.score}
        />
    );
}
