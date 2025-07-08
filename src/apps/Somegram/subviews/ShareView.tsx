import style from '../style.module.css';
import { Trans, useTranslation } from 'react-i18next';
import { QRCode } from '@genai-fi/base';
import { useSearchParams } from 'react-router-dom';
import ViewContainer from './ViewContainer';
import { appToCode } from '@genaism/apps/Start/codePrefix';

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
                    values={{ codeText: appToCode('profile', code) }}
                    i18nKey="profile.messages.connection"
                    components={{
                        Code: <em />,
                    }}
                />
            </div>
            <div className={style.link}>{window.location.host}</div>
        </ViewContainer>
    );
}
