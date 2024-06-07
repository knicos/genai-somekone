import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import { getNodeData } from '@genaism/services/graph/nodes';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import style from './style.module.css';

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

interface Props {
    item: ScoredRecommendation;
}

export default function CandidateItem({ item }: Props) {
    const { t } = useTranslation();
    return (
        <li data-testid="candidate-item">
            <div className={style.listIcon}>
                <ImageSearchIcon fontSize="large" />
            </div>
            <div className={style.listColumn}>{generateCandidateMessage(item, t)}</div>
        </li>
    );
}
