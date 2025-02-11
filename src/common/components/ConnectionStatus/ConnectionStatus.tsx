import { ConnectionStatus as BaseConnectionStatus, Peer2Peer } from '@knicos/genai-base';
import style from './style.module.css';
import { EventProtocol } from '@genaism/protocol/protocol';

interface Props {
    position: 'corner' | 'center';
    ready: boolean;
    peer?: Peer2Peer<EventProtocol>;
    visibility?: number;
}

export default function ConnectionStatus({ peer, ready, position, visibility }: Props) {
    return (
        <div className={position === 'corner' ? style.corner : style.center}>
            <BaseConnectionStatus
                api={import.meta.env.VITE_APP_APIURL}
                appName={import.meta.env.DEV ? 'dev' : 'somekone'}
                ready={ready}
                peer={peer}
                visibility={visibility}
            />
        </div>
    );
}
