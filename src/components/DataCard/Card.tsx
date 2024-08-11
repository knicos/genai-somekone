import style from './style.module.css';
import PieScore from '../PieScore/PieScore';
import { PropsWithChildren } from 'react';
import { timeAgo } from './time';
import { ContentNodeId } from '@knicos/genai-recom';
import { useContentData } from '@genaism/hooks/content';

interface Props extends PropsWithChildren {
    image?: ContentNodeId;
    message?: JSX.Element | string;
    title?: JSX.Element | string;
    score?: number;
    time?: number;
    avatar?: JSX.Element;
}

export default function Card({ image, message, score, children, avatar, time, title }: Props) {
    const data = useContentData(image);
    return (
        <li
            className={style.item}
            data-testid="data-card"
        >
            <div className={style.header}>
                {image && (
                    <img
                        src={data}
                        alt="Content item"
                        width={75}
                        height={75}
                    />
                )}
                {avatar}
                <div className={image ? style.message : style.messageNoImage}>
                    {message && <div>{message}</div>}
                    {title && <h2>{title}</h2>}
                    {time && <div className={style.time}>{timeAgo(time)}</div>}
                </div>
                {score && <PieScore value={score} />}
            </div>
            {children}
        </li>
    );
}
