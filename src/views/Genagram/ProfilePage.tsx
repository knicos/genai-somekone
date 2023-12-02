import Profile from '@genaism/components/UserProfile/UserProfile';
import { IconButton, Slide } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilState, useSetRecoilState } from 'recoil';
import { menuShowFeedActions, menuShowProfile } from '@genaism/state/menuState';
import style from './style.module.css';
import { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

interface Props {
    onClose?: () => void;
}

export default function ProfilePage({ onClose }: Props) {
    const { t } = useTranslation();
    const [showProfile, setShowProfile] = useRecoilState(menuShowProfile);
    const setShowFeedActions = useSetRecoilState(menuShowFeedActions);

    useEffect(() => {
        setShowFeedActions(!showProfile);
    }, [showProfile]);

    return (
        <Slide
            direction="left"
            in={showProfile}
            mountOnEnter
            unmountOnExit
        >
            <section className={style.dataContainer}>
                <div className={style.dataInner}>
                    <header>
                        <h1>{t('profile.titles.yourProfile')}</h1>
                        <IconButton
                            size="large"
                            onClick={() => {
                                setShowProfile(false);
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
