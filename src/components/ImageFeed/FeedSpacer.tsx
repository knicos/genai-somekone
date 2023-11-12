import style from './style.module.css';

interface Props {
    size: number;
}

export default function FeedSpacer({ size }: Props) {
    const height = size > 0 ? size * 550 : 0;
    return (
        <div
            className={style.placeholder}
            style={{ height: `${height}px` }}
        />
    );
}
