import { GuideAction, useGuide } from '@genaism/hooks/guidance';
import { MenuItem, MenuList } from '@mui/material';
import style from './style.module.css';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SomekoneSettings, useSettingDeserialise, useSettingSerialise } from '@genaism/hooks/settings';
import ActionButton from './ActionButton';
import { useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { useServices } from '@genaism/hooks/services';
import { cancelSessionSave } from '@genaism/services/loader/session';
import disimilarUsers from '@genaism/util/autoUsers';
import { useSetAtom } from 'jotai';
import { menuSelectedUser } from '../../state/menuState';
import { getZipBlob, loadFile } from '@genaism/services/loader/fileLoader';

const AUTOPLAY_ACTIVITY_DELAY = 30 * 1000;

interface Props {
    guide: string | File;
}

export default function Guidance({ guide }: Props) {
    const data = useGuide(guide);
    const deserial = useSettingDeserialise();
    const serial = useSettingSerialise();
    const navigate = useNavigate();
    const { search } = useLocation();
    const [params, setParams] = useSearchParams();
    const page = params.get('page');
    const index = page !== null ? parseInt(page) : -1;
    const { replay, profiler, content, actionLog } = useServices();
    const [autoplay, setAutoplay] = useState(-1);
    const setSelected = useSetAtom(menuSelectedUser);

    // Hack to fix react router conceptual bug
    const paramsRef = useRef(setParams);
    paramsRef.current = setParams;

    const settingsRef = useRef<SomekoneSettings | undefined>(undefined);
    const dataRef = useRef(new Set<string>());

    const doAction = useCallback(
        (action: GuideAction) => {
            deserial(action);

            const url = action.url;
            if (url) {
                navigate(url + search);
            }
            if (action.replay !== undefined) {
                if (action.replay && !replay.isPlaying()) {
                    replay.start();
                }
                if (!action.replay) {
                    replay.stop();
                }
            }
            if (action.autoPlay !== undefined) {
                setAutoplay(action.autoPlay);
            }
            if (action.autoSelect) {
                const bestUser = disimilarUsers(profiler, 1)[0];
                setSelected(bestUser);
            }
            if (action.data) {
                action.data.forEach((d) => {
                    if (dataRef.current.has(d)) return;
                    dataRef.current.add(d);
                    getZipBlob(d).then((blob) => {
                        loadFile(content, actionLog, blob);
                    });
                });
            }
        },
        [navigate, replay, deserial, search, setSelected, profiler, content, actionLog]
    );

    useEffect(() => {
        // Save current settings for later restore
        const oldSettings = serial();
        settingsRef.current = oldSettings;
        if (data && data.initActions) {
            data.initActions.forEach((act) => {
                const action = data.actions[act];
                if (action) {
                    deserial(action);

                    if (action.replay !== undefined) {
                        if (action.replay && !replay.isPlaying()) {
                            replay.start();
                        }
                        if (!action.replay) {
                            replay.stop();
                        }
                    }
                    if (action.autoPlay !== undefined) {
                        setAutoplay(action.autoPlay);
                    }
                    if (action.autoSelect) {
                        const bestUser = disimilarUsers(profiler, 1)[0];
                        setSelected(bestUser);
                    }
                }
            });
        }
        let reloadHandler: () => void;

        if (data && data.reloadOnReplayEnd) {
            reloadHandler = () => {
                cancelSessionSave();
                navigate(0);
            };
            replay.broker.on('replayfinished', reloadHandler);
        }

        if (data && data.firstStep !== undefined) {
            paramsRef.current((prev) => {
                if (!prev.has('page')) {
                    prev.set('page', `${data.firstStep}`);
                }
                return prev;
            });
        } else if (data) {
            paramsRef.current((prev) => {
                if (!prev.has('page')) {
                    prev.set('page', '0');
                }
                return prev;
            });
        }

        return () => {
            if (reloadHandler) {
                replay.broker.off('replayfinished', reloadHandler);
            }
            // Restore original settings when closing guide
            if (settingsRef.current) {
                deserial(settingsRef.current);
            }
        };
    }, [data, deserial, replay, navigate, serial, profiler, setSelected]);

    useEffect(() => {
        if (autoplay > 0 && data) {
            const state = {
                lastActive: 0,
                autoPlayCounter: 0,
            };
            const t = setInterval(() => {
                const now = Date.now();
                if (navigator.userActivation) {
                    if (navigator.userActivation.isActive) {
                        state.lastActive = now;
                    }
                }

                if (state.lastActive === 0) {
                    state.autoPlayCounter++;
                    if (state.autoPlayCounter === autoplay) {
                        state.autoPlayCounter = 0;
                        paramsRef.current((prev) => {
                            const p = Number(prev.get('page') || 0);
                            const currentStep = data?.steps[p];
                            const n =
                                currentStep?.next !== undefined
                                    ? currentStep.next
                                    : p < data.steps.length - 1
                                      ? p + 1
                                      : 0;
                            prev.set('page', `${n}`);
                            return prev;
                        });
                    }
                } else if (now - state.lastActive > AUTOPLAY_ACTIVITY_DELAY) {
                    cancelSessionSave();
                    navigate(0);
                }
            }, 1000);
            return () => clearInterval(t);
        }
    }, [autoplay, data, navigate]);

    useEffect(() => {
        if (data && index >= 0 && index < data.steps.length) {
            const step = data.steps[index];

            step.actions.forEach((act) => {
                const action = data.actions[act];
                if (!action) return;

                doAction(action);
            });
        }
    }, [index, data, doAction]);

    const mappedSteps = useMemo(() => data?.steps.map((step, index) => ({ step, index })), [data]) || [];
    const currentStep = data?.steps[index];
    const filtered = mappedSteps.filter((s) => s.step.title);

    return (
        <nav
            className={style.container}
            data-testid="guidance"
        >
            <MenuList>
                {filtered.map((step, i) => (
                    <MenuItem
                        selected={index >= step.index && index < (filtered[i + 1]?.index || index + 1)}
                        onClick={() =>
                            paramsRef.current((prev) => {
                                prev.set('page', `${step.index}`);
                                return prev;
                            })
                        }
                        key={step.index}
                    >
                        {step.step.title}
                    </MenuItem>
                ))}
            </MenuList>
            {currentStep && currentStep.actionButton && (
                <div className={style.actionContainer}>
                    <ActionButton
                        action={currentStep.actionButton}
                        onAction={() => {
                            if (currentStep.actionButton) {
                                const act = data.actions[currentStep.actionButton];
                                if (act) {
                                    doAction(act);
                                }
                            }
                        }}
                    />
                </div>
            )}
        </nav>
    );
}
