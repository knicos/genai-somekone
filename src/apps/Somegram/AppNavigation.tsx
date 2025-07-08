import ShareIcon from '@mui/icons-material/Share';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import HomeIcon from '@mui/icons-material/Home';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton, Tooltip } from '@mui/material';
import { useLocation, useNavigate } from 'react-router-dom';
import style from './style.module.css';
import { useAtomValue } from 'jotai';
import { uiDarkMode } from '@genaism/common/state/uiState';
import { useProfilerService } from '@genaism/hooks/services';
import { MouseEvent } from 'react';
import { appConfiguration } from '@genaism/common/state/configState';
import { SMConfig } from '@genaism/common/state/smConfig';
import { useTranslation } from 'react-i18next';

interface Props {
    code: string;
}

export default function AppNavigation({ code }: Props) {
    const { t } = useTranslation();
    const location = useLocation();
    const navigate = useNavigate();
    const darkMode = useAtomValue(uiDarkMode);
    const profiler = useProfilerService();
    const config = useAtomValue<SMConfig>(appConfiguration);

    const currentView = location.pathname.split('/').pop();

    return (
        <div className={darkMode ? style.darkNavOuter : style.navOuter}>
            <nav className={style.appNav}>
                <Tooltip
                    title={t('feed.titles.home')}
                    arrow
                    placement="top"
                >
                    <IconButton
                        color={currentView === 'feed' ? 'secondary' : 'inherit'}
                        size="large"
                        onClick={(e: MouseEvent) => {
                            navigate('feed', { replace: true });
                            e.preventDefault();
                        }}
                        href="feed"
                    >
                        <HomeIcon fontSize="inherit" />
                    </IconButton>
                </Tooltip>
                {!config.hidePostContent && (
                    <Tooltip
                        title={t('feed.titles.post')}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            color={currentView === 'post' ? 'secondary' : 'inherit'}
                            size="large"
                            onClick={(e: MouseEvent) => {
                                navigate('post', { replace: currentView !== 'feed' });
                                e.preventDefault();
                            }}
                            href="post"
                        >
                            <AddAPhotoIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
                {!config.hideDataView && (
                    <Tooltip
                        title={t('feed.titles.data')}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            color={currentView === 'data' ? 'secondary' : 'inherit'}
                            size="large"
                            onClick={(e: MouseEvent) => {
                                navigate('data', { replace: currentView !== 'feed' });
                                e.preventDefault();
                            }}
                            href="data"
                        >
                            <QueryStatsIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
                {!config.hideProfileView && (
                    <Tooltip
                        title={t('feed.titles.profile')}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            color={currentView === 'profile' ? 'secondary' : 'inherit'}
                            size="large"
                            onClick={(e: MouseEvent) => {
                                navigate('profile', { replace: currentView !== 'feed' });
                                e.preventDefault();
                            }}
                            href="profile"
                        >
                            <PersonIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
                {!config.hideRecommendationsView && (
                    <Tooltip
                        title={t('feed.titles.recommendations')}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            color={currentView === 'recommendations' ? 'secondary' : 'inherit'}
                            size="large"
                            onClick={(e: MouseEvent) => {
                                navigate('recommendations', { replace: currentView !== 'feed' });
                                e.preventDefault();
                            }}
                            href="recommendations"
                        >
                            <ImageSearchIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
                {!config.hideOwnProfile && (
                    <IconButton
                        color={currentView === profiler.getCurrentUser() ? 'secondary' : 'inherit'}
                        size="large"
                        onClick={(e: MouseEvent) => {
                            navigate(`public/${profiler.getCurrentUser()}`, { replace: currentView !== 'feed' });
                            e.preventDefault();
                        }}
                        href={`public/${profiler.getCurrentUser()}`}
                    >
                        <AccountCircleIcon fontSize="inherit" />
                    </IconButton>
                )}
                {!config.hideShareProfile && (
                    <Tooltip
                        title={t('feed.titles.share')}
                        arrow
                        placement="top"
                    >
                        <IconButton
                            size="large"
                            color={currentView === 'share' ? 'secondary' : 'inherit'}
                            onClick={(e: MouseEvent) => {
                                navigate(`share?code=${code}`, { replace: currentView !== 'feed' });
                                e.preventDefault();
                            }}
                            href={`share?code=${code}`}
                        >
                            <ShareIcon fontSize="inherit" />
                        </IconButton>
                    </Tooltip>
                )}
            </nav>
        </div>
    );
}
