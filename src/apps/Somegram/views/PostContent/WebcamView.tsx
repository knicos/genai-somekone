import { useCallback, useState } from 'react';
import style from './style.module.css';
import { Webcam } from '@genai-fi/base';
import CaptureButton from './CaptureButton';

interface Props {
    onImage: (image: string) => void;
}

export default function WebcamView({ onImage }: Props) {
    const [capturing, setCapturing] = useState(false);
    const doCapture = useCallback(
        (canvas: HTMLCanvasElement) => {
            setCapturing(false);
            onImage(canvas.toDataURL('image/jpeg', 0.9));
        },
        [onImage]
    );
    return (
        <>
            <div className={style.webcamContainer}>
                <Webcam
                    size={512}
                    onCapture={doCapture}
                    capture={capturing}
                />
            </div>
            <div className={style.buttonContainer}>
                <CaptureButton
                    capturing={capturing}
                    onChange={setCapturing}
                />
            </div>
        </>
    );
}
