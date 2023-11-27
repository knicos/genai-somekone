import style from './style.module.css';
import { useParams } from 'react-router-dom';
import Feed from '../../components/Feed/Feed';
import { useCallback, useEffect, useRef, useState } from 'react';
import usePeer from '../../hooks/peer';
import randomId from '../../util/randomId';
import { SMConfig } from './smConfig';
import EnterUsername from './EnterUsername';
import { EventProtocol } from '../../protocol/protocol';
import { ProfileSummary } from '@genaism/services/profiler/profilerTypes';
import { getActionLogSince, getCurrentUser } from '@genaism/services/profiler/profiler';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import Loading from '@genaism/components/Loading/Loading';
import { useTranslation } from 'react-i18next';

const MYCODE = randomId(10);

export function Component() {
    const { t } = useTranslation();
    const { code } = useParams();
    const [config, setConfig] = useState<SMConfig>();
    const [username, setUsername] = useState<string>();
    const logRef = useRef(0);

    const onData = useCallback((data: EventProtocol) => {
        console.log('GOT DATA', data);
        if (data.event === 'eter:config' && data.configuration) {
            setConfig(data.configuration);
        }
    }, []);

    const { ready, send } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    useEffect(() => {
        if (username && send) {
            send({ event: 'eter:reguser', username, id: getCurrentUser() });
        }
    }, [username, send]);

    const doProfile = useCallback(
        (profile: ProfileSummary) => {
            if (send) {
                send({ event: 'eter:profile_data', profile, id: getCurrentUser() });
                const logs = getActionLogSince(logRef.current);
                logRef.current = Date.now();
                send({ event: 'eter:action_log', id: getCurrentUser(), log: logs });
            }
        },
        [send]
    );

    return (
        <>
            <Loading
                loading={!!code && (!ready || !config)}
                message={t('feed.messages.loading')}
            >
                <div className={style.page}>
                    {config && !username && <EnterUsername onUsername={setUsername} />}
                    {config && username && (
                        <Feed
                            content={config.content}
                            onProfile={doProfile}
                        />
                    )}
                </div>
            </Loading>
            <ErrorDialog />
        </>
    );
}
