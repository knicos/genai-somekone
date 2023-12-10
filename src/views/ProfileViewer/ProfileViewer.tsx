import Loading from '@genaism/components/Loading/Loading';
import usePeer from '@genaism/hooks/peer';
import { EventProtocol } from '@genaism/protocol/protocol';
import { useCallback, useRef, useState } from 'react';
import { useParams } from 'react-router';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import useRandom from '@genaism/hooks/random';
import { useTranslation } from 'react-i18next';
import DataProfile from '@genaism/components/DataProfile/DataProfile';
import { appendActionLog, createUserProfile, replaceProfile } from '@genaism/services/profiler/profiler';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';
import { useSetRecoilState } from 'recoil';
import { errorNotification } from '@genaism/state/errorState';
import { BottomNavigation, BottomNavigationAction, Slide, SlideProps } from '@mui/material';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import UserProfile from '@genaism/components/UserProfile/UserProfile';
import style from './style.module.css';
import { appConfiguration } from '@genaism/state/settingsState';
import { SMConfig } from '../Genagram/smConfig';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

function slideDirection(my: number, current: number, previous: number): SlideProps['direction'] {
    if (my === current) {
        if (previous < current) return 'left';
        return 'right';
    } else {
        if (previous < current) return 'right';
        return 'left';
    }
}

export function Component() {
    const { t } = useTranslation();
    const { code } = useParams();
    const [id, setID] = useState<UserNodeId>();
    const MYCODE = useRandom(10);
    const setError = useSetRecoilState(errorNotification);
    const [hasData, setHasData] = useState(false);
    const [page, setPage] = useState(0);
    const prevPage = useRef(0);
    const setConfig = useSetRecoilState<SMConfig>(appConfiguration);

    const onData = useCallback((data: EventProtocol) => {
        console.log('GOT DATA', data);
        if (data.event === 'eter:reguser') {
            try {
                createUserProfile(data.id, data.username);
            } catch (e) {
                console.warn(e);
            }
            setID(data.id);
        } else if (data.event === 'eter:profile_data') {
            replaceProfile(data.id, data.profile);
        } else if (data.event === 'eter:action_log') {
            appendActionLog(data.log, data.id);
        } else if (data.event === 'eter:config') {
            setConfig((old) => ({ ...old, ...data.configuration }));
            if (data.content) {
                data.content.forEach((c, ix) => {
                    getZipBlob(c)
                        .then(async (blob) => {
                            if (data.content && blob.arrayBuffer) {
                                data.content[ix] = await blob.arrayBuffer();
                            }

                            await loadFile(blob);
                            setHasData(true);
                        })
                        .catch((e) => {
                            console.error(e);
                            setError((p) => {
                                const s = new Set(p);
                                s.add('content_not_found');
                                return s;
                            });
                        });
                });
            }
        }
    }, []);

    const { ready } = usePeer<EventProtocol>({ code: code && `sm-${MYCODE}`, server: `sm-${code}`, onData });

    return (
        <>
            <Loading
                loading={!ready || !hasData || !id}
                message={t('profile.messages.loading')}
            >
                <div className={style.container}>
                    <Slide
                        direction={slideDirection(0, page, prevPage.current)}
                        in={page === 0}
                        mountOnEnter
                        unmountOnExit
                    >
                        <div className={style.pageContainer}>
                            <DataProfile id={id} />
                        </div>
                    </Slide>
                    <Slide
                        direction={slideDirection(1, page, prevPage.current)}
                        in={page === 1}
                        mountOnEnter
                        unmountOnExit
                    >
                        <div className={style.pageContainer}>
                            <UserProfile id={id} />
                        </div>
                    </Slide>
                    <Slide
                        direction={slideDirection(2, page, prevPage.current)}
                        in={page === 2}
                        mountOnEnter
                        unmountOnExit
                    >
                        <div></div>
                    </Slide>
                    <BottomNavigation
                        showLabels
                        value={page}
                        onChange={(_, newValue) =>
                            setPage((old) => {
                                prevPage.current = old;
                                return newValue;
                            })
                        }
                    >
                        <BottomNavigationAction
                            label={t('profile.actions.data')}
                            icon={<QueryStatsIcon fontSize="large" />}
                        />
                        <BottomNavigationAction
                            label={t('profile.actions.profile')}
                            icon={<PersonIcon fontSize="large" />}
                        />
                        <BottomNavigationAction
                            label={t('profile.actions.recommendations')}
                            icon={<ImageSearchIcon fontSize="large" />}
                        />
                    </BottomNavigation>
                </div>
            </Loading>
            <ErrorDialog />
        </>
    );
}
