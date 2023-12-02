import { PropsWithChildren } from 'react';
import style from './style.module.css';

interface Props extends PropsWithChildren {}

export default function Table({ children }: Props) {
    return (
        <ul
            data-testid="log-table"
            className={style.table}
        >
            {children}
        </ul>
    );
}
