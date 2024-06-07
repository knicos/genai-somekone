import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import CandidateItem from './CandidateItem';
import style from './style.module.css';
import ScoresItem from './ScoresItem';

interface Props {
    recommendation: ScoredRecommendation;
}

export default function RecommendationsTable({ recommendation }: Props) {
    return (
        <div>
            <ul className={style.tableList}>
                <CandidateItem item={recommendation} />
                <ScoresItem item={recommendation} />
            </ul>
        </div>
    );
}
