import { IconButton } from '@mui/material';
import style from '../style.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { QRCode } from '@knicos/genai-base';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { useNavigate } from 'react-router';
import { useSearchParams } from 'react-router-dom';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();
    const [params] = useSearchParams();
    const navigate = useNavigate();

    const code = params.get('code') || '';

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
                    <h1>{t('profile.titles.shareProfile')}</h1>
                </div>
            </header>
            <QRCode
                url={`${window.location.origin}/profile/${code}`}
                size="large"
                label={t('feed.aria.shareLink')}
            />
            <div className={style.shareMessage}>
                <Trans
                    values={{ codeText: code }}
                    i18nKey="dashboard.messages.connection"
                    components={{
                        Code: <em />,
                    }}
                />
            </div>
            <div className={style.link}>{window.location.host}</div>
        </ViewContainer>
    );
}
