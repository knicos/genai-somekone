import { IconButton, IconButtonProps } from '@mui/material';
import style from './style.module.css';

interface Props extends IconButtonProps {
    count: number;
}

export default function IconButtonDot({ count, ...props }: Props) {
    return (
        <div className={style.button}>
            <IconButton {...props} />
            {count > 0 && <div className={style.dot}>{count}</div>}
        </div>
    );
}
