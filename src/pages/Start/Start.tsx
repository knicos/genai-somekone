import style from './style.module.css';
import ErrorDialog from '../dialogs/ErrorDialog/ErrorDialog';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LangSelect from '@genaism/components/LangSelect/LangSelect';
import { Privacy } from '@knicos/genai-base';
import gitInfo from '../../generatedGitInfo.json';

export function Component() {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const doKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                if (value.length === 10) {
                    navigate(`/profile/${value}`);
                } else {
                    navigate(`/app/${value}`);
                }
            }
        },
        [navigate]
    );

    const doGo = useCallback(() => {
        if (inputRef.current) {
            const value = inputRef.current.value;
            if (value.length === 10) {
                navigate(`/profile/${value}`);
            } else {
                navigate(`/app/${value}`);
            }
        }
    }, [navigate]);

    return (
        <div className={style.container}>
            <div className={style.language}>
                <LangSelect />
            </div>
            <div className={style.innerContainer}>
                <img
                    src="/logo192_bw.png"
                    alt="GenAI logo"
                    width={192}
                    height={192}
                />
                <TextField
                    label={t('start.labels.enterCode')}
                    onKeyDown={doKeyDown}
                    fullWidth
                    className={style.textbox}
                    inputRef={inputRef}
                />
                <Button
                    variant="contained"
                    fullWidth
                    size="large"
                    component="a"
                    onClick={doGo}
                >
                    {t('start.actions.go')}
                </Button>
                <div className={style.spacer} />
                <Button
                    variant="outlined"
                    href="/library"
                    className={style.createButton}
                >
                    {t('start.actions.createNew')}
                </Button>
                <ErrorDialog />
            </div>
            <Privacy
                appName="somekone"
                tag={gitInfo.gitTag || 'notag'}
            />
        </div>
    );
}
