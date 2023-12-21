import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { IconMenuContext } from './context';

interface Props extends PropsWithChildren {
    placement?: 'left' | 'right' | 'top' | 'bottom';
    label?: JSX.Element;
    anchor?: HTMLElement;
}

export default function IconMenu({ placement, label, children }: Props) {
    return (
        <nav className={style[placement || 'left']}>
            <IconMenuContext.Provider value={placement || 'left'}>
                <div className={placement === 'top' || placement === 'bottom' ? style.logoColumn : style.logoRow}>
                    {label}
                </div>
                {children}
            </IconMenuContext.Provider>
        </nav>
    );
}
