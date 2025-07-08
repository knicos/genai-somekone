import { LargeButton } from '@genai-fi/base';
import { Alert, IconButton, MenuItem, Select, SelectChangeEvent, TextField } from '@mui/material';
import { useCallback, useMemo, useRef, useState } from 'react';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useLogger } from '@genaism/hooks/logger';
import { useAtomValue } from 'jotai';
import { availableUsers } from '@genaism/common/state/sessionState';
import RestoreIcon from '@mui/icons-material/Restore';
import { useDuplicateTabCheck } from '@genaism/hooks/duplicateTab';
import { anonUsername, UserNodeId } from '@knicos/genai-recom';
import { useProfilerService } from '@genaism/hooks/services';

function generateUsername() {
    const iter = Math.floor(Math.random() * 20);
    for (let i = 0; i < iter; ++i) anonUsername();
    return anonUsername();
}

interface Props {
    onUsername: (name: string) => void;
    autoUsername?: boolean;
}

interface FormErrors {
    username?: 'missing' | 'bad' | 'long' | 'short';
    fullname?: 'missing' | 'bad';
}

export default function EnterUsername({ onUsername, autoUsername }: Props) {
    const { t } = useTranslation();
    const ref = useRef<HTMLInputElement>(null);
    const nameref = useRef<HTMLInputElement>(null);
    const logger = useLogger();
    const [errors, setErrors] = useState<FormErrors>({});
    const users = useAtomValue(availableUsers);
    const [showRestore, setShowRestore] = useState(false);
    const foundTab = useDuplicateTabCheck();
    const profiler = useProfilerService();

    const anonName = useMemo(
        () => (autoUsername ? `${generateUsername()}${Math.floor(Math.random() * 100)}` : ''),
        [autoUsername]
    );

    const doUsernameKey = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            setErrors((old) => ({ ...old, username: undefined }));
            if (logger) return;
            if (e.key === 'Enter') {
                const name = (e.target as HTMLInputElement).value;
                onUsername(name);
            }
        },
        [onUsername, logger]
    );

    const doFullnameKey = useCallback(() => {
        setErrors((old) => ({ ...old, fullname: undefined }));
    }, []);

    const doSelect = useCallback(
        (e: SelectChangeEvent) => {
            const id = e.target.value as UserNodeId;
            profiler.setUser(id);
            const item = users.find((u) => u.id === id);
            if (item) {
                onUsername(item.name);
            }
        },
        [onUsername, users, profiler]
    );

    return (
        <div className={style.userContainer}>
            {foundTab && <Alert severity="warning">{t('feed.messages.alreadyOpen')}</Alert>}
            {!autoUsername ? (
                <TextField
                    inputRef={ref}
                    label={t('feed.labels.enterUsername')}
                    onKeyDown={doUsernameKey}
                    required
                    error={!!errors.username}
                    helperText={errors.username ? t(`feed.messages.usernameError.${errors.username}`) : undefined}
                />
            ) : (
                <TextField
                    label={t('feed.labels.enterUsername')}
                    required
                    value={anonName}
                    disabled={true}
                    error={!!errors.username}
                    helperText={errors.username ? t(`feed.messages.usernameError.${errors.username}`) : undefined}
                />
            )}
            {logger && (
                <TextField
                    inputRef={nameref}
                    required
                    label={t('feed.labels.enterFullname')}
                    error={!!errors.fullname}
                    onKeyDown={doFullnameKey}
                    helperText={errors.fullname ? t(`feed.messages.fullnameError.${errors.fullname}`) : undefined}
                />
            )}
            <LargeButton
                onClick={() => {
                    if (autoUsername) {
                        onUsername(anonName);
                    } else if (ref.current) {
                        if (!ref.current.value) {
                            setErrors({ username: 'missing' });
                            return;
                        }
                        if (ref.current.value.length > 30) {
                            setErrors({ username: 'long' });
                            return;
                        }
                        if (ref.current.value.length < 3) {
                            setErrors({ username: 'short' });
                            return;
                        }
                        if (logger && nameref.current) {
                            if (!nameref.current.value) {
                                setErrors({ fullname: 'missing' });
                                return;
                            }
                            logger('enter_username', { username: ref.current.value, fullname: nameref.current.value });
                        }
                        onUsername(ref.current.value);
                    }
                }}
                variant="contained"
            >
                {t('feed.actions.enterUser')}
            </LargeButton>
            {!showRestore && (
                <div>
                    <IconButton
                        onClick={() => setShowRestore(true)}
                        aria-label={t('feed.aria.restoreUser')}
                    >
                        <RestoreIcon />
                    </IconButton>
                </div>
            )}
            {showRestore && (
                <Select
                    value=""
                    onChange={doSelect}
                >
                    {users.map((u) => (
                        <MenuItem
                            key={u.id}
                            value={u.id}
                        >
                            {u.name}
                        </MenuItem>
                    ))}
                </Select>
            )}
        </div>
    );
}
