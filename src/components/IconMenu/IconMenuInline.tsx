import { PropsWithChildren } from 'react';
import { IconMenuContext } from './context';
import style from './style.module.css';

export default function IconMenuInline({ children }: PropsWithChildren) {
    return (
        <div className={style.inlineBar}>
            <IconMenuContext.Provider value="top">{children}</IconMenuContext.Provider>
        </div>
    );
}
