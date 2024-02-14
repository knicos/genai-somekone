import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { IconMenuContext } from './context';

interface Props extends PropsWithChildren {
    placement?: 'left' | 'right' | 'top' | 'bottom';
    label?: JSX.Element;
    anchor?: HTMLElement;
    selected?: boolean;
    title?: string;
}

export default function IconMenu({ placement, label, children, selected, title }: Props) {
    return (
        <nav
            className={style[placement || 'left']}
            aria-label={title}
        >
            <IconMenuContext.Provider value={placement || 'left'}>
                <div
                    className={`${placement === 'top' || placement === 'bottom' ? style.logoColumn : style.logoRow} ${
                        selected ? style.selected : ''
                    }`}
                >
                    {label}
                </div>
                {children}
            </IconMenuContext.Provider>
        </nav>
    );
}
