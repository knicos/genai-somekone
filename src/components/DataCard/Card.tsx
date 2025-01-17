import style from './style.module.css';
import { PropsWithChildren } from 'react';
import { timeAgo } from './time';
import ScorePie from '../RecommendationsTable/ScorePie';

interface Props extends PropsWithChildren {
    image?: string;
    message?: JSX.Element | string;
    title?: JSX.Element | string;
    score?: number;
    time?: number;
    avatar?: JSX.Element;
}

export default function Card({ image, message, score, children, avatar, time, title }: Props) {
    return (
        <li
            className={style.item}
            data-testid="data-card"
        >
            <div className={style.header}>
                {image && (
                    <img
                        src={image}
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
                {score !== undefined && (
                    <ScorePie
                        value={Math.min(1, score)}
                        maxValue={1}
                        size={65}
                        color="white"
                        bgColor="#005566"
                        showValue
                    />
                )}
            </div>
            {children}
        </li>
    );
}
