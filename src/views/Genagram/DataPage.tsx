import Profile from '@genaism/components/DataProfile/DataProfile';
import { IconButton, Slide } from '@mui/material';
import HighlightOffIcon from '@mui/icons-material/HighlightOff';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { menuShowData, menuShowFeedActions } from '@genaism/state/menuState';
import style from './style.module.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useLogger } from '@genaism/hooks/logger';

interface Props {
    onClose?: () => void;
}

export default function DataPage({ onClose }: Props) {
    const { t } = useTranslation();
    const [showData, setShowData] = useRecoilState(menuShowData);
    const setShowFeedActions = useSetRecoilState(menuShowFeedActions);
    const logger = useLogger();

    useEffect(() => {
        setShowFeedActions(!showData);
        if (logger) {
            if (showData) logger('open_data_view');
            else logger('close_data_view');
        }
    }, [showData, setShowFeedActions, logger]);

    return (
        <Slide
            direction="left"
            in={showData}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <h1>{t('profile.titles.yourData')}</h1>
                        <IconButton
                            size="large"
                            onClick={() => {
                                setShowData(false);
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
                    <Profile />
                </div>
            </section>
        </Slide>
    );
}
