import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import TableItem from '../Table/TableItem';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { WEIGHTS } from '@genaism/services/recommender/scoring';

function generateMessage(item: ScoredRecommendation, t: TFunction) {
    let part1: string;
    let part2: string;

    switch (item.candidateOrigin) {
        case 'topic_affinity':
            part1 = t('recommendations.labels.topicCandidate', { topic: item.topic || '' });
            break;
        case 'random':
            part1 = t('recommendations.labels.random');
            break;
        default:
            part1 = '';
    }

    const weightedComponents = [item.tasteSimilarityScore, item.randomnessScore];
    const maxComponent = weightedComponents.reduce((cmax, v, ix) => (v > weightedComponents[cmax] ? ix : cmax), 0);

    switch (maxComponent) {
        case 0:
            part2 = t('recommendations.labels.tasteScore', {
                score: Math.round((item.tasteSimilarityScore / WEIGHTS.tasteSimilarity) * 10),
            });
            break;
        case 1:
            part2 = t('recommendations.labels.randomScore', {
                score: Math.round((item.randomnessScore / WEIGHTS.randomness / 0.1) * 10),
            });
            break;
        default:
            part2 = '';
    }

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
