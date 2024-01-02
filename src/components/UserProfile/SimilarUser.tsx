import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getNodeData } from '@genaism/services/graph/nodes';
import PieScore from '../PieScore/PieScore';
import style from './style.module.css';

interface Props {
    id: UserNodeId;
    score: number;
}

interface UserData {
    name: string;
}

export default function SimilarUser({ id, score }: Props) {
    const name = getNodeData<UserData>(id)?.name || '';
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
