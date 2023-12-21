import { useContext } from 'react';
import style from './style.module.css';
import { IconMenuContext } from './context';

export default function Spacer() {
    const placement = useContext(IconMenuContext);
    return (
        <div className={placement === 'left' || placement === 'right' ? style.menuSpacerRow : style.menuSpacerColumn} />
    );
}
