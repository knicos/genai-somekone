import { SpeedDial, SpeedDialAction } from '@mui/material';
import ShareIcon from '@mui/icons-material/Share';
import MenuIcon from '@mui/icons-material/Menu';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import CloseIcon from '@mui/icons-material/Close';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import { menuShowData, menuShowProfile, menuShowRecommendations, menuShowShareProfile } from '@genaism/state/menuState';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { appConfiguration } from '@genaism/state/settingsState';

export default function SpeedMenu() {
    const { t } = useTranslation();
    const setShowData = useSetRecoilState(menuShowData);
    const setShowProfile = useSetRecoilState(menuShowProfile);
    const setShowShareProfile = useSetRecoilState(menuShowShareProfile);
    const setShowRecommendations = useSetRecoilState(menuShowRecommendations);
    const [showMenu, setShowMenu] = useState(false);
    const config = useRecoilValue(appConfiguration);

    return (
        <SpeedDial
            open={showMenu}
            onClose={() => setShowMenu(false)}
            onOpen={() => setShowMenu(true)}
            direction="down"
            ariaLabel="Additional data views menu"
            icon={<MenuIcon />}
            openIcon={<CloseIcon />}
            FabProps={{ color: 'secondary' }}
        >
            {!config?.hideShareProfile && (
                <SpeedDialAction
                    icon={<ShareIcon />}
                    tooltipTitle={'Share your profile'}
                    tooltipOpen
                    onClick={() => {
                        setShowShareProfile(true);
                        setShowMenu(false);
                    }}
                />
            )}
            {!config?.hideDataView && (
                <SpeedDialAction
                    icon={<QueryStatsIcon />}
                    tooltipTitle={t('profile.titles.yourData')}
                    tooltipOpen
                    onClick={() => {
                        setShowData(true);
                        setShowMenu(false);
                    }}
                />
            )}
            {!config?.hideProfileView && (
                <SpeedDialAction
                    icon={<PersonIcon />}
                    tooltipTitle={t('profile.titles.yourProfile')}
                    tooltipOpen
                    onClick={() => {
                        setShowProfile(true);
                        setShowMenu(false);
                    }}
                />
            )}
            {!config?.hideRecommendationsView && (
                <SpeedDialAction
                    icon={<ImageSearchIcon />}
                    tooltipTitle={'Your recommendations'}
                    tooltipOpen
                    onClick={() => {
                        setShowRecommendations(true);
                        setShowMenu(false);
                    }}
                />
            )}
        </SpeedDial>
    );
}
