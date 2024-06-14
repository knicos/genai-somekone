import { UserNodeId } from '@genaism/services/graph/graphTypes';
import style from './style.module.css';
import { getUserData } from '@genaism/services/users/users';

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
    noLimit?: boolean;
}

export default function Comment({ comment, user, noLimit }: Props) {
    const username = getUserData(user)?.name;
    return (
        <li className={style.commentItem}>
            <div className={style.commentText}>{noLimit ? comment : limitString(comment)}</div>
            <div className={style.commentUser}>{username || 'Unknown'}</div>
        </li>
    );
}
