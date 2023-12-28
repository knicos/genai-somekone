import { getContentData } from '@genaism/services/content/content';
import PieScore from '../PieScore/PieScore';
import dayjs from 'dayjs';
import relTime from 'dayjs/plugin/relativeTime';
import style from './style.module.css';
import { ContentNodeId } from '@genaism/services/graph/graphTypes';
dayjs.extend(relTime);

interface Props {
    image?: ContentNodeId;
    icon?: JSX.Element;
    message?: string;
    score?: number;
    time?: number;
    highlight?: boolean;
}

export default function TableItem({ image, message, score, time, highlight, icon }: Props) {
    return (
        <li
            data-testid="log-row"
            className={highlight ? style.special : style.normal}
        >
            {icon}
            {image && (
                <div className={style.image}>
                    <img
                        width={75}
                        height={75}
                        src={getContentData(image)}
                    />
                </div>
            )}
            <div className={style.message}>
                <div>{message}</div>
                {time && <div className={style.time}>{dayjs(time).fromNow()}</div>}
            </div>
            {score !== undefined && <PieScore value={score} />}
        </li>
    );
}
