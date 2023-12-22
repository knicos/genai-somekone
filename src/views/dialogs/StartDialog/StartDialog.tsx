import { UserInfo } from '../../Dashboard/userInfo';
import style from './style.module.css';
import QRCode from '@genaism/components/QRCode/QRCode';
import { useTranslation, Trans } from 'react-i18next';
import { LargeButton } from '@genaism/components/Button/Button';
import { useRecoilState } from 'recoil';
import { menuShowShare } from '@genaism/state/menuState';
import { useCallback } from 'react';

interface Props {
    users: UserInfo[];
    code: string;
}

export default function StartDialog({ users, code }: Props) {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowShare);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    return showDialog ? (
        <div className={style.groupedItems}>
            <div className={style.connectMessage}>
                <QRCode
                    url={`${window.location.origin}/feed/${code}`}
                    size="large"
                />
                <div className={style.column}>
                    <div>
                        <Trans
                            values={{ codeText: code }}
                            i18nKey="dashboard.messages.connection"
                            components={{
                                Code: <em />,
                            }}
                        />
                    </div>
                    <a
                        href={`${window.location.origin}`}
                        target="_blank"
                        rel="noreferrer"
                    >
                        {window.location.host}
                    </a>
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
                    onClick={doClose}
                >
                    {t('dashboard.actions.start')}
                </LargeButton>
            </div>
        </div>
    ) : null;
}
