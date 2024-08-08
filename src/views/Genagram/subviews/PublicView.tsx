import { useTranslation } from 'react-i18next';
import { useNavigate, useParams } from 'react-router';
import ViewContainer from './ViewContainer';
import style from '../style.module.css';
import { IconButton } from '@mui/material';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import OwnProfile from '@genaism/components/PersonalProfile/PersonalProfile';
import { isUserID } from '@knicos/genai-recom';

export function Component() {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { userId } = useParams();

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
                </div>
            </header>
            <OwnProfile id={userId && isUserID(userId) ? userId : undefined} />
        </ViewContainer>
    );
}
