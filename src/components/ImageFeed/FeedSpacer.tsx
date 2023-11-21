import style from './style.module.css';

interface Props {
    size: number;
}

export default function FeedSpacer({ size }: Props) {
    const height = size > 0 ? size * Math.min(550, screen.width + 50) : 0;
    return (
        <div
            className={style.placeholder}
            style={{ height: `${height}px` }}
        />
    );
}
