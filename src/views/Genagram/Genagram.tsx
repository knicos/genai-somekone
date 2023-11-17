import style from './style.module.css';
import { useParams, useSearchParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';
import { useCallback, useEffect, useState } from 'react';
import usePeer from '../../hooks/peer';
import randomId from '../../util/randomId';
import EnterCode from './EnterCode';
import { SMConfig } from './smConfig';
import { CircularProgress } from '@mui/material';
import EnterUsername from './EnterUsername';
import { EventProtocol } from '../../protocol/protocol';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { getMyUserId } from '@genaism/services/profiler/profiler';

const MYCODE = randomId(10);

export function Component() {
    const [params] = useSearchParams();
    const { code } = useParams();
    const [config, setConfig] = useState<SMConfig>();
    const [username, setUsername] = useState<string>();

    const onData = useCallback((data: EventProtocol) => {
        console.log('GOT DATA', data);
        if (data.event === 'eter:config' && data.configuration) {
            setConfig(data.configuration);
        }
    }, []);

    const { ready, send } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    useEffect(() => {
        if (username && send) {
            send({ event: 'eter:reguser', username, id: getMyUserId() });
        }
    }, [username, send]);

    const doProfile = useCallback(
        (profile: ProfileSummary) => {
            console.log('PROFILE', profile);
            if (send) send({ event: 'eter:profile_data', profile, id: getMyUserId() });
        },
        [send]
    );

    return (
        <div className={style.page}>
            {code && !ready && <CircularProgress />}
            {!code && !params.has('local') && <EnterCode />}
            {config && !username && <EnterUsername onUsername={setUsername} />}
            {config && username && (
                <Feed
                    content={config.content}
                    onProfile={doProfile}
                />
            )}
        </div>
    );
}
