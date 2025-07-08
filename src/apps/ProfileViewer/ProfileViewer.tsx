import { Outlet, useParams } from 'react-router-dom';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { ConnectionStatus, useRandom } from '@genai-fi/base';
import style from './style.module.css';
import BlockDialog from '../../common/views/BlockDialog/BlockDialog';
import ViewerProtocol from './ViewerProtocol';
import AppNavigation from './AppNavigation';
import { useProfilerService } from '@genaism/hooks/services';
import { Peer } from '@genai-fi/base/hooks/peer';

export function Component() {
    const { code } = useParams();
    const MYCODE = useRandom(10);
    const profiler = useProfilerService();

    return (
        <Peer
            host={import.meta.env.VITE_APP_PEER_SERVER}
            secure={import.meta.env.VITE_APP_PEER_SECURE === '1'}
            peerkey={import.meta.env.VITE_APP_PEER_KEY || 'peerjs'}
            port={import.meta.env.VITE_APP_PEER_PORT ? parseInt(import.meta.env.VITE_APP_PEER_PORT) : 443}
            server={`sm-${code}`}
            code={`sm-${MYCODE}`}
        >
            <div className={style.connectionStatus}>
                <ConnectionStatus
                    api={import.meta.env.VITE_APP_APIURL}
                    appName={import.meta.env.DEV ? 'dev' : 'somekone'}
                    visibility={0}
                />
            </div>
            <ViewerProtocol
                onID={(id) => {
                    profiler.setUser(id);
                }}
            >
                <div className={style.container}>
                    <Outlet />
                    <AppNavigation />
                    <BlockDialog />
                </div>
                <span></span>
            </ViewerProtocol>
            <ErrorDialog />
        </Peer>
    );
}
