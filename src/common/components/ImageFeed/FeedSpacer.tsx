import { useRef } from 'react';
import style from './style.module.css';

interface Props {
    size: number;
}

export default function FeedSpacer({ size }: Props) {
    const ref = useRef<HTMLDivElement>(null);
    const height = size > 0 ? size * ((ref.current?.clientWidth || 0) + 50) : 0;
    return (
        <div
            ref={ref}
            className={style.placeholder}
            style={{ height: `${height}px` }}
        />
    );
}
