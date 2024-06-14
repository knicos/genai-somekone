import { UserNodeId } from '@genaism/services/graph/graphTypes';
import PieScore from '../PieScore/PieScore';
import style from './style.module.css';
import { getUserData } from '@genaism/services/users/users';

interface Props {
    id: UserNodeId;
    score: number;
}

export default function SimilarUser({ id, score }: Props) {
    const name = getUserData(id)?.name || '';
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
