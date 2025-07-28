import CandidateItem from './CandidateItem';
import style from './style.module.css';
import ScoresItem from './ScoresItem';
import ExplainItem from './ExplainItem';
import { ScoredRecommendation, UserNodeId } from '@genai-fi/recom';

interface Props {
    recommendation: ScoredRecommendation;
    userId: UserNodeId;
    hideExplain?: boolean;
    hideCandidate?: boolean;
    hideScores?: boolean;
}

export default function RecommendationsTable({
    userId,
    recommendation,
    hideExplain,
    hideCandidate,
    hideScores,
}: Props) {
    return (
        <div>
            <ul className={style.tableList}>
                {!hideCandidate && (
                    <CandidateItem
                        item={recommendation}
                        userId={userId}
                    />
                )}
                {!hideScores && <ScoresItem item={recommendation} />}
                {!hideExplain && <ExplainItem item={recommendation} />}
            </ul>
        </div>
    );
}
