import Item from './Item';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';
import style from './style.module.css';

interface Props {
    recommendations: ScoredRecommendation[];
}

export default function RecommendationsTable({ recommendations }: Props) {
    // const [size, setSize] = useState(15);

    return (
        <>
            <ul
                className={style.table}
                data-testid="log-table"
            >
                {recommendations.map((l, ix) => (
                    <Item
                        key={recommendations.length - ix}
                        item={l}
                    />
                ))}
            </ul>
        </>
    );
}
