import { JSX, PropsWithChildren } from 'react';
import style from './style.module.css';
import { IconMenuContext } from './context';

interface Props extends PropsWithChildren {
    placement?: 'free' | 'left' | 'right' | 'top' | 'bottom';
    label?: JSX.Element;
    anchor?: HTMLElement;
    selected?: boolean;
    title?: string;
    x?: number;
    y?: number;
}

export default function IconMenu({ placement = 'free', x = 0, y = 0, label, children, selected, title }: Props) {
    return (
        <nav
            className={style[placement]}
            aria-label={title}
            style={placement === 'free' ? { left: `${x}px`, top: `${y}px`, transform: 'translateX(-50%)' } : undefined}
        >
            <IconMenuContext.Provider value={placement}>
                <div
                    className={`${
                        placement === 'top' || placement === 'bottom' || placement === 'free'
                            ? style.logoColumn
                            : style.logoRow
                    } ${selected ? style.selected : ''}`}
                >
                    {label}
                </div>
                {children}
            </IconMenuContext.Provider>
        </nav>
    );
}
