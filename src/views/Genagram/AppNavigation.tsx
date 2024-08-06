import ShareIcon from '@mui/icons-material/Share';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import HomeIcon from '@mui/icons-material/Home';
import { IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import style from './style.module.css';

interface Props {
    code: string;
}

export default function AppNavigation({ code }: Props) {
    const location = useLocation();
    const navigate = useNavigate();

    const currentView = location.pathname.split('/').pop();

    return (
        <div className={style.navOuter}>
            <nav className={style.appNav}>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('feed', { replace: true })}
                >
                    <HomeIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('data', { replace: currentView !== 'feed' })}
                >
                    <QueryStatsIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('profile', { replace: currentView !== 'feed' })}
                >
                    <PersonIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('recommendations', { replace: currentView !== 'feed' })}
                >
                    <ImageSearchIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    size="large"
                    color="inherit"
                    onClick={() => navigate(`share?code=${code}`, { replace: currentView !== 'feed' })}
                >
                    <ShareIcon fontSize="inherit" />
                </IconButton>
            </nav>
        </div>
    );
}
