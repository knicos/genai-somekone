import { useUserProfile } from '@genaism/services/profiler/hooks';
import ImageCloud from '../ImageCloud/ImageCloud';
import { useEffect, useState } from 'react';
import { LogEntry } from '@genaism/services/profiler/profilerTypes';
import { getActionLog } from '@genaism/services/profiler/profiler';
import ActionLogTable from '../ActionLogTable/ActionLogTable';
import style from './style.module.css';

interface Props {
    id?: string;
}

export default function Profile({ id }: Props) {
    const [log, setLog] = useState<LogEntry[]>([]);
    const profile = useUserProfile(id);

    useEffect(() => {
        const alog = getActionLog(id);
        setLog(alog.filter((a) => !!a.id).reverse());
    }, [profile, id]);

    return (
        <div className={style.container}>
            <div>
                <svg
                    width="100%"
                    height="300px"
                    viewBox="-250 -150 500 300"
                >
                    <ImageCloud
                        content={profile.engagedContent}
                        size={500}
                    />
                </svg>
            </div>
            <ActionLogTable log={log} />
        </div>
    );
}
