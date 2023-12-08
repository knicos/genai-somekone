import Profile from '@genaism/components/DataProfile/DataProfile';
import { IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { menuShowData, menuShowFeedActions } from '@genaism/state/menuState';
import style from './style.module.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    onClose?: () => void;
}

export default function DataPage({ onClose }: Props) {
    const { t } = useTranslation();
    const [showData, setShowData] = useRecoilState(menuShowData);
    const setShowFeedActions = useSetRecoilState(menuShowFeedActions);

    useEffect(() => {
        setShowFeedActions(!showData);
    }, [showData]);

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
                        >
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </header>
                    <Profile />
                </div>
            </section>
        </Slide>
    );
}