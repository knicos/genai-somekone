import ShareIcon from '@mui/icons-material/Share';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import HomeIcon from '@mui/icons-material/Home';
import AddAPhotoIcon from '@mui/icons-material/AddAPhoto';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import style from './style.module.css';
import { useRecoilValue } from 'recoil';
import { uiDarkMode } from '@genaism/state/uiState';
import { useProfilerService } from '@genaism/hooks/services';

interface Props {
    code: string;
}

export default function AppNavigation({ code }: Props) {
    const location = useLocation();
    const navigate = useNavigate();
    const darkMode = useRecoilValue(uiDarkMode);
    const profiler = useProfilerService();

    const currentView = location.pathname.split('/').pop();

    return (
        <div className={darkMode ? style.darkNavOuter : style.navOuter}>
            <nav className={style.appNav}>
                <IconButton
                    color={currentView === 'feed' ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate('feed', { replace: true })}
                >
                    <HomeIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color={currentView === 'post' ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate('post', { replace: currentView !== 'feed' })}
                >
                    <AddAPhotoIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color={currentView === 'data' ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate('data', { replace: currentView !== 'feed' })}
                >
                    <QueryStatsIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color={currentView === 'profile' ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate('profile', { replace: currentView !== 'feed' })}
                >
                    <PersonIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color={currentView === 'recommendations' ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate('recommendations', { replace: currentView !== 'feed' })}
                >
                    <ImageSearchIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color={currentView === profiler.getCurrentUser() ? 'secondary' : 'inherit'}
                    size="large"
                    onClick={() => navigate(`public/${profiler.getCurrentUser()}`, { replace: currentView !== 'feed' })}
                >
                    <AccountCircleIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    size="large"
                    color={currentView === 'share' ? 'secondary' : 'inherit'}
                    onClick={() => navigate(`share?code=${code}`, { replace: currentView !== 'feed' })}
                >
                    <ShareIcon fontSize="inherit" />
                </IconButton>
            </nav>
        </div>
    );
}
