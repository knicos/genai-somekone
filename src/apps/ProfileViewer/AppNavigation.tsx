import QueryStatsIcon from '@mui/icons-material/QueryStats';
import PersonIcon from '@mui/icons-material/Person';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import { IconButton } from '@mui/material';
import { useLocation, useNavigate } from 'react-router';
import style from './style.module.css';

export default function AppNavigation() {
    const location = useLocation();
    const navigate = useNavigate();

    const currentView = location.pathname.split('/').pop();

    return (
        <div className={style.navOuter}>
            <nav
                className={style.appNav}
                data-testid="app-nav"
            >
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('data', { replace: true })}
                >
                    <QueryStatsIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('profile', { replace: currentView !== 'data' })}
                >
                    <PersonIcon fontSize="inherit" />
                </IconButton>
                <IconButton
                    color="inherit"
                    size="large"
                    onClick={() => navigate('recommendations', { replace: currentView !== 'data' })}
                >
                    <ImageSearchIcon fontSize="inherit" />
                </IconButton>
            </nav>
        </div>
    );
}
