import CandidateItem from './CandidateItem';
import style from './style.module.css';
import ScoresItem from './ScoresItem';
import ExplainItem from './ExplainItem';
import { ScoredRecommendation, UserNodeId } from '@knicos/genai-recom';

interface Props {
    recommendation: ScoredRecommendation;
    userId: UserNodeId;
}

export default function RecommendationsTable({ userId, recommendation }: Props) {
    return (
        <div>
            <ul className={style.tableList}>
                <CandidateItem
                    item={recommendation}
                    userId={userId}
                />
                <ScoresItem item={recommendation} />
                <ExplainItem item={recommendation} />
            </ul>
        </div>
    );
}
