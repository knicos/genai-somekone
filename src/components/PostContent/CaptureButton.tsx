import { useCallback, useEffect, useRef } from 'react';
import style from './button.module.css';

interface Props {
    capturing: boolean;
    onChange: (value: boolean) => void;
}

export default function CaptureButton({ capturing, onChange }: Props) {
    const buttonRef = useRef<HTMLButtonElement>(null);

    const startCapture = useCallback(() => onChange(true), [onChange]);
    const startTouchCapture = useCallback(
        (e: TouchEvent) => {
            if (e.cancelable) {
                e.preventDefault();
                e.stopImmediatePropagation();
                onChange(true);
            }
        },
        [onChange]
    );
    const stopCapture = useCallback(() => onChange(false), [onChange]);

    useEffect(() => {
        if (buttonRef.current) {
            buttonRef.current.focus();
            buttonRef.current.addEventListener('touchstart', startTouchCapture, { passive: false });
        }
    }, [buttonRef, startTouchCapture]);

    return (
        <button
            className={style.recordButton}
            ref={buttonRef}
            onMouseDown={startCapture}
            onMouseUp={stopCapture}
            onBlur={stopCapture}
            onMouseLeave={stopCapture}
            onTouchEnd={stopCapture}
            onTouchCancel={stopCapture}
        >
            <div className={style.buttonCircleOuter}>
                <div className={capturing ? style.buttonCircleActive : style.buttonCircleInner} />
            </div>
        </button>
    );
}
