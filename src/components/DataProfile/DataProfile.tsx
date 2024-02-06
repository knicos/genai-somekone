import { useActionLog, useUserProfile } from '@genaism/services/profiler/hooks';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useState } from 'react';
import ActionLogTable from '../ActionLogTable/ActionLogTable';
import style from './style.module.css';
import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { getCurrentUser } from '@genaism/services/profiler/state';

interface Props {
    id?: UserNodeId;
}

export default function Profile({ id }: Props) {
    const [wcSize, setWCSize] = useState(300);
    const profile = useUserProfile(id);
    const log = useActionLog(id);

    const doResize = useCallback((size: number) => {
        setWCSize(size);
    }, []);

    return (
        <div className={style.container}>
            <div>
                <svg
                    width="100%"
                    height="300px"
                    viewBox={`${-(wcSize * 1.67)} ${-wcSize} ${wcSize * 1.67 * 2} ${wcSize * 2}`}
                >
                    <ImageCloud
                        content={profile.engagedContent}
                        size={300}
                        onSize={doResize}
                    />
                </svg>
            </div>
            <ActionLogTable
                user={id || getCurrentUser()}
                log={log}
            />
        </div>
    );
}
