import Item from './Item';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import Cards from '../DataCard/Cards';

interface Props {
    recommendations: ScoredRecommendation[];
}

export default function RecommendationsTable({ recommendations }: Props) {
    return (
        <Cards>
            {recommendations.map((l, ix) => (
                <Item
                    key={recommendations.length - ix}
                    item={l}
                />
            ))}
        </Cards>
    );
}
