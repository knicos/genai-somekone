import Item from './Item';
import Table from '../Table/Table';
import { ScoredRecommendation } from '@genaism/services/recommender/recommenderTypes';

interface Props {
    recommendations: ScoredRecommendation[];
}

export default function RecommendationsTable({ recommendations }: Props) {
    // const [size, setSize] = useState(15);

    return (
        <>
            <Table>
                {recommendations.map((l, ix) => (
                    <Item
                        key={recommendations.length - ix}
                        item={l}
                    />
                ))}
            </Table>
        </>
    );
}
