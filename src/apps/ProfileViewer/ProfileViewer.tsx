import { Outlet, useParams } from 'react-router-dom';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { ConnectionStatus, useRandom } from '@genai-fi/base';
import style from './style.module.css';
import BlockDialog from '../../common/views/BlockDialog/BlockDialog';
import ViewerProtocol from './ViewerProtocol';
import AppNavigation from './AppNavigation';
import { useProfilerService } from '@genaism/hooks/services';
import { Peer } from '@genai-fi/base/hooks/peer';
import PeerEnv from '@genaism/env';

export function Component() {
    const { code } = useParams();
    const MYCODE = useRandom(10);
    const profiler = useProfilerService();

    return (
        <Peer
            host={PeerEnv.host}
            secure={PeerEnv.secure}
            peerkey={PeerEnv.peerkey}
            port={PeerEnv.port}
            server={`sm-${code}`}
            code={`sm-${MYCODE}`}
        >
            <div className={style.connectionStatus}>
                <ConnectionStatus
                    api={PeerEnv.apiUrl}
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
