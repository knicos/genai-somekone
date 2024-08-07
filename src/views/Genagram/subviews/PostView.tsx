import { IconButton } from '@mui/material';
import style from '../style.module.css';
import { useTranslation } from 'react-i18next';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import PostContent from '@genaism/components/PostContent/PostContent';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();
    const navigate = useNavigate();

    return (
        <ViewContainer>
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
                    <h1>{t('profile.titles.newPost')}</h1>
                </div>
            </header>
            <PostContent />
        </ViewContainer>
    );
}
