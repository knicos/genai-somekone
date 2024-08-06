import { UserNodeId } from '@knicos/genai-recom';
import PieScore from '../PieScore/PieScore';
import style from './style.module.css';
import { useProfilerService } from '@genaism/hooks/services';

interface Props {
    id: UserNodeId;
    score: number;
}

export default function SimilarUser({ id, score }: Props) {
    const profiler = useProfilerService();
    const name = profiler.getUserData(id)?.name || '';
    return (
        <div className={style.similarUser}>
            <div className={style.userName}>
                <b>{name}</b>
            </div>
            <PieScore
                value={score}
                color="grey"
            />
        </div>
    );
}
