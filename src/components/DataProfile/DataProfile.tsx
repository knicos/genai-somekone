import { useUserProfile } from '@genaism/services/profiler/hooks';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useCallback, useEffect, useState } from 'react';
import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { getActionLog } from '@genaism/services/profiler/profiler';
import ActionLogTable from '../ActionLogTable/ActionLogTable';
import style from './style.module.css';

interface Props {
    id?: string;
}

export default function Profile({ id }: Props) {
    const [wcSize, setWCSize] = useState(300);
    const [log, setLog] = useState<LogEntry[]>([]);
    const profile = useUserProfile(id);

    useEffect(() => {
        const alog = getActionLog(id);
        setLog(alog.filter((a) => !!a.id).reverse());
    }, [profile, id]);

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
            <ActionLogTable log={log} />
        </div>
    );
}
