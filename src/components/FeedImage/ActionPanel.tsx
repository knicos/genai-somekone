import React, { useCallback, useEffect, useRef } from 'react';
import style from './style.module.css';

const OPENTIMEOUT = 4000;
const IGNOREDTIMEOUT = 1000;

export type VerticalPosition = 'top' | 'vfull' | 'bottom';
export type HorizontalPosition = 'left' | 'hfull' | 'right';

interface Props extends React.PropsWithChildren {
    onClose?: () => void;
    horizontal: HorizontalPosition;
    vertical: VerticalPosition;
    noTimeout?: boolean;
}

export default function ActionPanel({ onClose, children, horizontal, vertical, noTimeout }: Props) {
    const timerRef = useRef(-1);

    const doLeave = useCallback(() => {
        if (timerRef.current !== -1) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = window.setTimeout(() => {
            timerRef.current = -1;
            if (onClose) onClose();
        }, IGNOREDTIMEOUT);
    }, [onClose]);

    const doEnter = useCallback(() => {
        if (timerRef.current !== -1) {
            clearTimeout(timerRef.current);
        }
    }, []);

    useEffect(() => {
        if (!noTimeout) {
            timerRef.current = window.setTimeout(() => {
                timerRef.current = -1;
                if (onClose) onClose();
            }, OPENTIMEOUT);
        }
        return () => {
            if (timerRef.current !== -1) {
                clearTimeout(timerRef.current);
            }
        };
    }, [onClose, noTimeout]);

    return (
        <div
            className={`${style.panel} ${style[horizontal]} ${style[vertical]}`}
            onMouseLeave={doLeave}
            onMouseEnter={doEnter}
        >
            {children}
        </div>
    );
}
