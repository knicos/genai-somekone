import { PropsWithChildren, useEffect, useState } from 'react';
import style from './style.module.css';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props extends PropsWithChildren {
    title?: string;
    onClose?: () => void;
}

export default function AppPanel({ title, onClose, children, ...props }: Props) {
    const [visible, setVisible] = useState(true);

    useEffect(() => {
        if (!visible && onClose) {
            setTimeout(onClose, 320);
        }
    }, [visible, onClose]);

    return (
        <div className={visible ? style.backgroundVisible : style.backgroundInvisible}>
            <section
                className={style.panel}
                {...props}
            >
                <header>
                    {title && <h1>{title}</h1>}
                    {onClose && (
                        <IconButton
                            onClick={() => setVisible(false)}
                            color="inherit"
                            data-testid="panel-close-button"
                        >
                            <CloseIcon />
                        </IconButton>
                    )}
                </header>
                <div className={style.content}>{children}</div>
            </section>
        </div>
    );
}
