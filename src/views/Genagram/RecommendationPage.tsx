import { IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { menuShowFeedActions, menuShowRecommendations } from '@genaism/state/menuState';
import style from './style.module.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import RecommendationsProfile from '@genaism/components/RecommendationsProfile/RecommendationsProfile';

interface Props {
    onClose?: () => void;
}

export default function RecommendationPage({ onClose }: Props) {
    const { t } = useTranslation();
    const [show, setShow] = useRecoilState(menuShowRecommendations);
    const setShowFeedActions = useSetRecoilState(menuShowFeedActions);

    useEffect(() => {
        setShowFeedActions(!show);
    }, [show]);

    return (
        <Slide
            direction="left"
            in={show}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <h1>{t('profile.titles.yourRecommendations')}</h1>
                        <IconButton
                            size="large"
                            onClick={() => {
                                setShow(false);
                                if (onClose) onClose();
                            }}
                        >
                            <CloseIcon fontSize="large" />
                        </IconButton>
                    </header>
                    <RecommendationsProfile />
                </div>
            </section>
        </Slide>
    );
}
