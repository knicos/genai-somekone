import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getNodeData } from '@genaism/services/graph/nodes';
import style from './style.module.css';

const MAX_LENGTH = 100;

function limitString(value: string) {
    if (value.length > MAX_LENGTH) {
        return `${value.substring(0, MAX_LENGTH)}...`;
    } else {
        return value;
    }
}

interface Props {
    comment: string;
    user: UserNodeId;
}

interface UserData {
    name: string;
}

export default function Comment({ comment, user }: Props) {
    const username = getNodeData<UserData>(user)?.name;
    return (
        <li className={style.commentItem}>
            <div className={style.commentText}>{limitString(comment)}</div>
            <div className={style.commentUser}>{username || 'Unknown'}</div>
        </li>
    );
}
