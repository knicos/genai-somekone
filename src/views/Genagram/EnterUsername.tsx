import { LargeButton } from '@genaism/components/Button/Button';
import { TextField } from '@mui/material';
import { useCallback, useRef } from 'react';
import style from './style.module.css';
import { useTranslation } from 'react-i18next';

interface Props {
    onUsername: (name: string) => void;
}

export default function EnterUsername({ onUsername }: Props) {
    const { t } = useTranslation();
    const ref = useRef<HTMLInputElement>(null);
    const doKeyDown = useCallback((e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            onUsername((e.target as HTMLInputElement).value);
        }
    }, []);
    return (
        <div className={style.userContainer}>
            <TextField
                inputRef={ref}
                label="Enter Username"
                onKeyDown={doKeyDown}
            />
            <LargeButton
                onClick={() => ref.current && onUsername(ref.current.value)}
                variant="contained"
            >
                {t('feed.actions.enterUser')}
            </LargeButton>
        </div>
    );
}
