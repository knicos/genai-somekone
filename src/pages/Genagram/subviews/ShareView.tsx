import style from '../style.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { QRCode } from '@knicos/genai-base';
import { useSearchParams } from 'react-router-dom';
import ViewContainer from './ViewContainer';

export function Component() {
    const { t } = useTranslation();
    const [params] = useSearchParams();

    const code = params.get('code') || '';

    return (
        <ViewContainer title={t('profile.titles.shareProfile')}>
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
