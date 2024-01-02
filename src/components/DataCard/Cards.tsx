import { PropsWithChildren } from 'react';
import style from './style.module.css';

export default function Cards({ children }: PropsWithChildren) {
    return (
        <ul
            className={style.table}
            data-testid="data-cards"
        >
            {children}
        </ul>
    );
}
