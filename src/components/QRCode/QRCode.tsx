import { useRef, useEffect } from 'react';
import qr from 'qrcode';
import style from './style.module.css';

interface Props {
    url: string;
    size?: 'small' | 'large';
    code?: string;
    label?: string;
}

export default function QRCode({ url, size, code, label }: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            qr.toCanvas(canvas.current, url, { width: size === 'large' ? 250 : 164 }).catch((e) => console.error(e));
        }
    }, [url, size]);

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
            className={style.link}
            aria-label={label}
        >
            <canvas
                data-testid="qr-code-canvas"
                width={164}
                height={164}
                ref={canvas}
            />
            {code && <div>{code}</div>}
        </a>
    );
}
