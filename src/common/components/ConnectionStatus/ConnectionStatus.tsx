import { ConnectionStatus as BaseConnectionStatus } from '@genai-fi/base';
import style from './style.module.css';
import { useEffect, useState } from 'react';
import { usePeerObject } from '@genai-fi/base/hooks/peer';

interface Props {
    position: 'corner' | 'center';
    visibility?: number;
}

export default function ConnectionStatus({ position, visibility }: Props) {
    const [quality, setQuality] = useState(0);
    const peer = usePeerObject();

    useEffect(() => {
        if (peer) {
            peer.on('quality', setQuality);
            setQuality(peer.quality);

            return () => {
                peer.off('quality', setQuality);
            };
        } else {
            setQuality(0);
        }
    }, [peer]);

    return visibility === undefined || quality <= visibility ? (
        <div className={position === 'corner' ? style.corner : style.center}>
            <BaseConnectionStatus
                api={import.meta.env.VITE_APP_APIURL}
                appName={import.meta.env.DEV ? 'dev' : 'somekone'}
                visibility={visibility}
            />
        </div>
    ) : null;
}
