import { UserInfo } from '@genaism/common/state/userInfo';
import style from './style.module.css';
import { QRCode } from '@knicos/genai-base';
import { useTranslation, Trans } from 'react-i18next';
import { LargeButton } from '@knicos/genai-base';
import { useRecoilState, useRecoilValue, useSetRecoilState } from 'recoil';
import { menuShowShare } from '@genaism/apps/Dashboard/state/menuState';
import { useCallback } from 'react';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import FolderOpenIcon from '@mui/icons-material/FolderOpen';
import Simulation from '@genaism/services/simulation/Simulation';
import { useServices } from '@genaism/hooks/services';
import { currentSimulation } from '@genaism/apps/Dashboard/state/simulationState';
import { userApp } from '@genaism/apps/Dashboard/state/settingsState';
import { appToCode } from '@genaism/apps/Start/codePrefix';

interface Props {
    users: UserInfo[];
    code: string;
}

export default function StartDialog({ users, code }: Props) {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowShare);
    const appType = useRecoilValue(userApp);
    const { recommender, actionLog } = useServices();
    const setSimulation = useSetRecoilState(currentSimulation);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    const openFile = useCallback(() => {
        document.getElementById('openfile')?.click();
        setShowDialog(false);
    }, [setShowDialog]);

    const app = appType === 'feed' ? 'app' : 'flow';

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
                        url={`${window.location.origin}/${app}/${code}`}
                        size="large"
                        label={t('dashboard.aria.linkForFeed')}
                    />
                    <div className={style.column}>
                        <div style={{ textAlign: 'center' }}>
                            <Trans
                                values={{ codeText: appToCode(appType, code) }}
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
                        <IconButton
                            onClick={openFile}
                            color="secondary"
                            size="large"
                            style={{ border: '1px solid rgb(174, 37, 174)' }}
                            aria-label={t('dashboard.labels.openTip')}
                        >
                            <FolderOpenIcon fontSize="medium" />
                        </IconButton>
                        <LargeButton
                            variant="outlined"
                            color="secondary"
                            data-testid="dashboard-demo-button"
                            onClick={() => {
                                const sim = new Simulation(recommender, actionLog);
                                sim.createAgents(12, {
                                    thresholds: { min: 0.1, max: 0.5 },
                                });
                                setSimulation(sim);
                                doClose();
                            }}
                        >
                            {t('dashboard.actions.demo')}
                        </LargeButton>
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
