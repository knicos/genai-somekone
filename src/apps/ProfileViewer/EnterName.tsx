import { LargeButton } from '@genai-fi/base';
import { TextField } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';
import { useLogger } from '@genaism/hooks/logger';
import { UserNodeId } from '@knicos/genai-recom';

interface Props {
    onName: (name: string) => void;
    hostUser: UserNodeId;
}

interface FormErrors {
    fullname?: 'missing' | 'bad';
}

export default function EnterName({ onName, hostUser }: Props) {
    const { t } = useTranslation();
    const ref = useRef<HTMLInputElement>(null);
    const logger = useLogger();
    const [errors, setErrors] = useState<FormErrors>({});

    const doNameKey = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            setErrors((old) => ({ ...old, username: undefined }));
            if (e.key === 'Enter') {
                const name = (e.target as HTMLInputElement).value;
                onName(name);
                if (logger) {
                    logger('enter_profile_fullname', { name, associatedUser: hostUser });
                }
            }
        },
        [onName, logger, hostUser]
    );

    return (
        <div className={style.userContainer}>
            {logger && (
                <TextField
                    inputRef={ref}
                    required
                    label={t('feed.labels.enterFullname')}
                    error={!!errors.fullname}
                    onKeyDown={doNameKey}
                    helperText={errors.fullname ? t(`feed.messages.fullnameError.${errors.fullname}`) : undefined}
                />
            )}
            <LargeButton
                onClick={() => {
                    if (ref.current) {
                        if (logger && ref.current) {
                            if (!ref.current.value) {
                                setErrors({ fullname: 'missing' });
                                return;
                            }
                            logger('enter_profile_fullname', { name: ref.current.value, associatedUser: hostUser });
                        }
                        onName(ref.current.value);
                    }
                }}
                variant="contained"
            >
                {t('feed.actions.enterUser')}
            </LargeButton>
        </div>
    );
}
