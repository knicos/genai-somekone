import style from './style.module.css';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import { useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import LangSelect from '@genaism/common/components/LangSelect/LangSelect';
import { Privacy } from '@genai-fi/base';
import gitInfo from '../../generatedGitInfo.json';
import { codeToApp } from './codePrefix';

export function Component() {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const doKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;
                const app = codeToApp(value);
                if (app === 'profile') {
                    navigate(`/profile/${value.slice(1)}`);
                } else if (app === 'feed') {
                    navigate(`/app/${value.slice(1)}`);
                } else if (app === 'flow') {
                    navigate(`/flow/${value.slice(1)}`);
                }
            }
        },
        [navigate]
    );

    const doGo = useCallback(() => {
        if (inputRef.current) {
            const value = inputRef.current.value;
            const app = codeToApp(value);
            if (app === 'profile') {
                navigate(`/profile/${value.slice(1)}`);
            } else if (app === 'feed') {
                navigate(`/app/${value.slice(1)}`);
            } else if (app === 'flow') {
                navigate(`/flow/${value.slice(1)}`);
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
                    src="/genai_logo_bw_192.png"
                    alt="GenAI logo"
                    width={192}
                    height={192}
                />
                <Button
                    variant="outlined"
                    href="/library"
                    className={style.createButton}
                >
                    {t('start.actions.createNew')}
                </Button>
                <div className={style.or}>{t('start.labels.or')}</div>
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
                <ErrorDialog />
            </div>
            <Privacy
                appName="somekone"
                tag={gitInfo.gitTag || 'notag'}
            />
        </div>
    );
}
