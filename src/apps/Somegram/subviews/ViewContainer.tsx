import { PropsWithChildren } from 'react';
import style from '../style.module.css';
import { useAtomValue } from 'jotai';
import { uiDarkMode } from '@genaism/common/state/uiState';
import { IconButton } from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';

interface Props extends PropsWithChildren {
    title?: string;
}

export default function ViewContainer({ title, children }: Props) {
    const darkMode = useAtomValue(uiDarkMode);
    const navigate = useNavigate();
    const { t } = useTranslation();

    return (
        <section className={darkMode ? style.darkContainer : style.dataContainer}>
            <div className={style.dataInner}>
                <header>
                    <div className={style.headerContainer}>
                        <IconButton
                            size="large"
                            color="inherit"
                            onClick={() => {
                                navigate(-1);
                            }}
                            aria-label={t('common.actions.close')}
                        >
                            <ArrowBackIcon
                                fontSize="large"
                                color="inherit"
                            />
                        </IconButton>
                        {title && <h1>{title}</h1>}
                    </div>
                </header>
                {children}
            </div>
        </section>
    );
}
