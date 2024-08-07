import { PropsWithChildren } from 'react';
import style from '../style.module.css';
import { useRecoilValue } from 'recoil';
import { uiDarkMode } from '@genaism/state/uiState';

export default function ViewContainer({ children }: PropsWithChildren) {
    const darkMode = useRecoilValue(uiDarkMode);

    return (
        <section className={darkMode ? style.darkContainer : style.dataContainer}>
            <div className={style.dataInner}>{children}</div>
        </section>
    );
}
