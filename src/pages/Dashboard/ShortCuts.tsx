import { IconMenuItem } from '@genaism/components/IconMenu';
import { MenuButton } from './MenuButton';
import { useTranslation } from 'react-i18next';
import AppsIcon from '@mui/icons-material/Apps';
import BubbleChartIcon from '@mui/icons-material/BubbleChart';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import style from './style.module.css';
import { useLocation, useNavigate } from 'react-router';

export default function ShortCuts() {
    const { t } = useTranslation();
    const { search, pathname } = useLocation();
    const navigate = useNavigate();

    const page = pathname.split('/').pop();

    return (
        <div className={style.treeContainer}>
            <IconMenuItem
                tooltip={t('menu.vis.usergrid')}
                fullWidth
                selected={page === 'usergrid'}
            >
                <MenuButton
                    color="inherit"
                    aria-label={t('menu.vis.usergrid')}
                    size="large"
                    variant="text"
                    fullWidth
                    onClick={() => navigate('usergrid' + search)}
                >
                    <AppsIcon fontSize="large" />
                </MenuButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('menu.vis.socialgraph')}
                fullWidth
                selected={page === 'socialgraph'}
            >
                <MenuButton
                    color="inherit"
                    aria-label={t('menu.vis.socialgraph')}
                    size="large"
                    variant="text"
                    fullWidth
                    onClick={() => navigate('socialgraph' + search)}
                >
                    <BubbleChartIcon fontSize="large" />
                </MenuButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('menu.vis.heatmap')}
                fullWidth
                selected={page === 'heatmaps'}
            >
                <MenuButton
                    color="inherit"
                    aria-label={t('menu.vis.heatmap')}
                    size="large"
                    variant="text"
                    fullWidth
                    onClick={() => navigate('heatmaps' + search)}
                >
                    <LocalFireDepartmentIcon fontSize="large" />
                </MenuButton>
            </IconMenuItem>
        </div>
    );
}
