import style from './style.module.css';
import ErrorDialog from '../../common/views/ErrorDialog/ErrorDialog';
import { useTranslation } from 'react-i18next';
import { Button, TextField } from '@mui/material';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import LangSelect from '@genaism/common/components/LangSelect/LangSelect';
import { HomeBanner, Privacy } from '@genai-fi/base';
import gitInfo from '../../generatedGitInfo.json';
import { codeToApp } from './codePrefix';

export function Component() {
    const { t } = useTranslation();
    const inputRef = useRef<HTMLInputElement>(null);
    const navigate = useNavigate();
    const [pinError, setPinError] = useState<boolean>(false);
    const doKeyDown = useCallback(
        (e: React.KeyboardEvent<HTMLInputElement>) => {
            if (e.key === 'Enter') {
                const value = (e.target as HTMLInputElement).value;

                if (value.length < 2) {
                    setPinError(true);
                    return;
                }

                if (/^[0-9]+$/.test(value) === false) {
                    setPinError(true);
                    return;
                }

                const app = codeToApp(value);
                if (app === 'profile') {
                    navigate(`/profile/${value.slice(1)}`);
                } else if (app === 'feed') {
                    navigate(`/app/${value.slice(1)}`);
                } else if (app === 'flow') {
                    navigate(`/flow/${value.slice(1)}`);
                } else {
                    setPinError(true);
                }
            }
        },
        [navigate]
    );

    const doGo = useCallback(() => {
        if (inputRef.current) {
            const value = inputRef.current.value;

            if (value.length < 2) {
                setPinError(true);
                return;
            }

            if (/^[0-9]+$/.test(value) === false) {
                setPinError(true);
                return;
            }

            const app = codeToApp(value);
            if (app === 'profile') {
                navigate(`/profile/${value.slice(1)}`);
            } else if (app === 'feed') {
                navigate(`/app/${value.slice(1)}`);
            } else if (app === 'flow') {
                navigate(`/flow/${value.slice(1)}`);
            } else {
                setPinError(true);
            }
        }
    }, [navigate]);

    return (
        <div className={style.container}>
            <div className={style.language}>
                <LangSelect />
            </div>
            <HomeBanner
                title={t('start.title')}
                subtitle={t('start.subtitle')}
                githubUrl="https://github.com/knicos/genai-somekone"
                githubLabel="Github"
                teachingMaterialsUrl={t('start.teachingMaterialsUrl')}
                teachingMaterialsLabel={t('start.teachingMaterials')}
            />
            <div className={style.innerContainer}>
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
                    error={pinError}
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
