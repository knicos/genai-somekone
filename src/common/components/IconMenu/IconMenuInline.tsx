import { JSX, PropsWithChildren } from 'react';
import { IconMenuContext } from './context';
import style from './style.module.css';

interface Props extends PropsWithChildren {
    label?: JSX.Element;
}

export default function IconMenuInline({ label, children }: Props) {
    return (
        <div className={style.inlineBar}>
            {label && <div className={style.logoColumn}>{label}</div>}
            <IconMenuContext.Provider value="top">{children}</IconMenuContext.Provider>
        </div>
    );
}
