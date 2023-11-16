import { PropsWithChildren } from 'react';
import style from './style.module.css';

interface Props extends PropsWithChildren {}

function gridShape(size: number): [number, number] {
    const s = Math.round(Math.sqrt(size));
    if (s * (s - 1) >= size) return [s, s - 1];
    if (s * s >= size) return [s, s];
    return [s + 1, s];
}

export default function GridLayout({ children }: Props) {
    const [cols, rows] = gridShape(Array.isArray(children) ? children.length : 1);

    console.log('SIZE', cols, rows);

    const childArray = Array.isArray(children) ? children : [children];

    return (
        <div className={style[`gridContainer${cols}`]}>
            {childArray.map((child) => {
                return <div className={style.gridItem}>{child}</div>;
            })}
        </div>
    );
}
