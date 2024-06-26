import { IconButton, Slide } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { menuShowFeedActions, menuShowShareProfile } from '@genaism/state/menuState';
import style from './style.module.css';
import { useEffect } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import QRCode from '@genaism/components/QRCode/QRCode';
import { useLogger } from '@genaism/hooks/logger';
import { Button } from '@genaism/components/Button/Button';

interface Props {
    code: string;
    onClose?: () => void;
}

export default function SharePage({ code, onClose }: Props) {
    const { t } = useTranslation();
    const [showShareProfile, setShowShareProfile] = useRecoilState(menuShowShareProfile);
    const setShowFeedActions = useSetRecoilState(menuShowFeedActions);
    const logger = useLogger();

    useEffect(() => {
        setShowFeedActions(!showShareProfile);
        if (logger) {
            if (showShareProfile) logger('open_share_view');
            else logger('close_share_view');
        }
    }, [showShareProfile, setShowFeedActions, logger]);

    return (
        <Slide
            direction="left"
            in={showShareProfile}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <h1>{t('profile.titles.shareProfile')}</h1>
                        <IconButton
                            size="large"
                            onClick={() => {
                                setShowShareProfile(false);
                                if (onClose) onClose();
                            }}
                            aria-label={t('dashboard.actions.close')}
                        >
                            <HighlightOffIcon
                                fontSize="large"
                                color="secondary"
                            />
                        </IconButton>
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
                    <div className={style.shareMessage}>
                        <Button
                            onClick={() => {
                                setShowShareProfile(false);
                                if (onClose) onClose();
                            }}
                            variant="contained"
                            startIcon={<CloseIcon />}
                        >
                            {t('dashboard.actions.close')}
                        </Button>
                    </div>
                </div>
            </section>
        </Slide>
    );
}
