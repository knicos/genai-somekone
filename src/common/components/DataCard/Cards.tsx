import { HTMLProps, PropsWithChildren } from 'react';
import style from './style.module.css';

type Props = PropsWithChildren & HTMLProps<HTMLUListElement>;

export default function Cards({ children, ...props }: Props) {
    return (
        <ul
            data-testid="data-cards"
            {...props}
            className={style.table}
        >
            {children}
        </ul>
    );
}
