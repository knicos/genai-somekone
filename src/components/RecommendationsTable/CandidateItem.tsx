import { TFunction } from 'i18next';
import { useTranslation } from 'react-i18next';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import style from './style.module.css';
import MiniUserGraph from '../MiniUserGraph/MiniUserGraph';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getUserData } from '@genaism/services/users/users';
import MiniTopicGraph from '../MiniTopicGraph/MiniTopicGraph';
import MiniCoengGraph from '../MiniCoengGraph/MiniCoengGraph';

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
                userName: item.similarUser ? getUserData(item.similarUser)?.name || '' : '',
            });
            break;
        default:
            part1 = '';
    }
    return part1;
}

interface Props {
    item: ScoredRecommendation;
    userId: UserNodeId;
}

export default function CandidateItem({ item, userId }: Props) {
    const { t } = useTranslation();
    return (
        <li data-testid="candidate-item">
            <div className={style.listIcon}>
                <ImageSearchIcon fontSize="large" />
            </div>
            <div className={style.listColumn}>
                {generateCandidateMessage(item, t)}
                {item.candidateOrigin === 'similar_user' && (
                    <div className={style.miniGraphBox}>
                        <MiniUserGraph
                            userId={userId}
                            pairedId={item.similarUser || 'user:none'}
                            contentId={item.contentId}
                        />
                    </div>
                )}
                {item.candidateOrigin === 'topic_affinity' && (
                    <div className={style.miniGraphBox}>
                        <MiniTopicGraph
                            userId={userId}
                            topic={item.topic || ''}
                            contentId={item.contentId}
                        />
                    </div>
                )}
                {item.candidateOrigin === 'coengagement' && (
                    <div className={style.miniGraphBox}>
                        <MiniCoengGraph
                            userId={userId}
                            originId={item.engagedItem || 'content:x'}
                            contentId={item.contentId}
                        />
                    </div>
                )}
            </div>
        </li>
    );
}
