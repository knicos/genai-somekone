import Profile from '@genaism/components/DataProfile/DataProfile';
import { IconButton, Slide } from '@mui/material';
import style from '../style.module.css';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';

export function Component() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <Slide
            direction="left"
            in={true}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <div className={style.headerContainer}>
                            <IconButton
                                size="large"
                                color="inherit"
                                onClick={() => {
                                    navigate(-1);
                                }}
                                aria-label={t('dashboard.actions.close')}
                            >
                                <ArrowBackIcon
                                    fontSize="large"
                                    color="inherit"
                                />
                            </IconButton>
                            <h1>{t('profile.titles.yourData')}</h1>
                        </div>
                    </header>
                    <Profile />
                </div>
            </section>
        </Slide>
    );
}
