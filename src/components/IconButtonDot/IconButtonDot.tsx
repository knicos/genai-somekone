import { IconButton, IconButtonProps } from '@mui/material';
import style from './style.module.css';

interface Props extends IconButtonProps {
    count: number;
    position?: 'left' | 'right';
}

export default function IconButtonDot({ count, position = 'right', ...props }: Props) {
    return (
        <div className={style.button}>
            <IconButton {...props} />
            {count > 0 && <div className={position === 'right' ? style.dot : style.leftDot}>{count}</div>}
        </div>
    );
}
