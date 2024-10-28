import Colourise, { isLight } from '@genaism/util/colours';
import style from './style.module.css';

interface Props {
    label: string;
}

const colours = new Colourise();

export default function HeatLabel({ label }: Props) {
    const colour = colours.get(label);

    return (
        <div
            className={style.label}
            style={{ background: colour, color: isLight(colour) ? 'black' : 'white' }}
        >
            {label}
        </div>
    );
}
