import { useRef, useEffect } from 'react';
import qr from 'qrcode';

interface Props {
    url: string;
}

export default function QRCode({ url }: Props) {
    const canvas = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        if (canvas.current) {
            qr.toCanvas(canvas.current, url).catch((e) => console.error(e));
        }
    }, [url]);

    return (
        <a
            href={url}
            target="_blank"
            rel="noreferrer"
        >
            <canvas
                data-testid="qr-code-canvas"
                width={164}
                height={164}
                ref={canvas}
            />
        </a>
    );
}