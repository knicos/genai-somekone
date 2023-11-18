import { UserInfo } from './userInfo';
import style from './style.module.css';
import QRCode from '@genaism/components/QRCode/QRCode';
import { useTranslation, Trans } from 'react-i18next';
import { LargeButton } from '@genaism/components/Button/Button';

interface Props {
    users: UserInfo[];
    code: string;
    onClose: () => void;
}

export default function StartDialog({ users, code, onClose }: Props) {
    const { t } = useTranslation();

    return (
        <div className={style.groupedItems}>
            <div className={style.connectMessage}>
                <QRCode url={`${window.location.origin}/feed/${code}`} />
                <div>
                    <Trans
                        values={{ linkText: window.location.host, codeText: code }}
                        i18nKey="dashboard.messages.connection"
                        components={{
                            PageLink: (
                                <a
                                    href={`${window.location.origin}`}
                                    target="_blank"
                                    rel="noreferrer"
                                />
                            ),
                            Code: <em />,
                        }}
                    />
                </div>
            </div>
            <div className={style.userListing}>
                {users.length === 0 && <div>{t('dashboard.messages.waitingPeople')}</div>}
                {users.length === 1 && <div>{t('dashboard.messages.onePerson', { count: users.length })}</div>}
                {users.length > 1 && <div>{t('dashboard.messages.manyPeople', { count: users.length })}</div>}
                <LargeButton
                    variant="contained"
                    color="secondary"
                    data-testid="dashboard-start-button"
                    onClick={onClose}
                >
                    {t('dashboard.actions.start')}
                </LargeButton>
            </div>
        </div>
    );
}
