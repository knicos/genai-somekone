import { UserNodeId } from '@genai-fi/recom';
import style from './style.module.css';
import { useProfilerService } from '@genaism/hooks/services';

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
    const profiler = useProfilerService();
    const username = profiler.getUserData(user)?.name;
    return (
        <li className={style.commentItem}>
            <div className={style.commentText}>{noLimit ? comment : limitString(comment)}</div>
            <div className={style.commentUser}>{username || 'Unknown'}</div>
        </li>
    );
}
