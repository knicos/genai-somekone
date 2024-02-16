import { UserInfo } from '../../Dashboard/userInfo';
import style from './style.module.css';
import QRCode from '@genaism/components/QRCode/QRCode';
import { useTranslation, Trans } from 'react-i18next';
import { LargeButton } from '@genaism/components/Button/Button';
import { useRecoilState } from 'recoil';
import { menuShowShare } from '@genaism/state/menuState';
import { useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle } from '@mui/material';

interface Props {
    users: UserInfo[];
    code: string;
    onDemo?: () => void;
}

export default function StartDialog({ users, code, onDemo }: Props) {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowShare);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    return (
        <Dialog
            open={showDialog}
            onClose={doClose}
            maxWidth="md"
        >
            <DialogTitle className={style.title}>{t('dashboard.titles.connectUsers')}</DialogTitle>
            <DialogContent>
                <div className={style.connectMessage}>
                    <QRCode
                        url={`${window.location.origin}/feed/${code}`}
                        size="large"
                        label={t('dashboard.aria.linkForFeed')}
                    />
                    <div className={style.column}>
                        <div style={{ textAlign: 'center' }}>
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
                    <div className={style.buttonGroup}>
                        {onDemo && (
                            <LargeButton
                                variant="outlined"
                                color="secondary"
                                data-testid="dashboard-demo-button"
                                onClick={() => {
                                    onDemo();
                                    doClose();
                                }}
                            >
                                {t('dashboard.actions.demo')}
                            </LargeButton>
                        )}
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
            </DialogContent>
        </Dialog>
    );
}
