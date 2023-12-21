import { PropsWithChildren } from 'react';
import style from './style.module.css';
import { IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props extends PropsWithChildren {
    title?: string;
    onClose?: () => void;
}

export default function AppPanel({ title, onClose, children }: Props) {
    return (
        <div className={style.backgroundVisible}>
            <section className={style.panel}>
                <header>
                    {title && <h1>{title}</h1>}
                    {onClose && (
                        <IconButton
                            onClick={onClose}
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
