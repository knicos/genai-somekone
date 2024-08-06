import { Outlet, useParams } from 'react-router';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { useRandom } from '@knicos/genai-base';
import style from './style.module.css';
import BlockDialog from '../dialogs/BlockDialog/BlockDialog';
import ViewerProtocol from './ViewerProtocol';
import AppNavigation from './AppNavigation';
import { useProfilerService } from '@genaism/hooks/services';

export function Component() {
    const { code } = useParams();
    const MYCODE = useRandom(10);
    const profiler = useProfilerService();

    return (
        <>
            <ViewerProtocol
                server={code}
                mycode={MYCODE}
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
        </>
    );
}
