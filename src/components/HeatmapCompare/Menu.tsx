import { useTranslation } from 'react-i18next';
import IconMenu from '../IconMenu/IconMenu';
import IconMenuItem from '../IconMenu/Item';
import style from './style.module.css';
import { IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RefreshIcon from '@mui/icons-material/Refresh';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import DownloadIcon from '@mui/icons-material/Download';
import { useEventEmit } from '@genaism/hooks/events';

interface Props {
    onOpenUserList: () => void;
    onRefresh: () => void;
}

export default function HeatmapMenu({ onOpenUserList, onRefresh }: Props) {
    const { t } = useTranslation();
    const saveGraph = useEventEmit('save_heat');

    return (
        <IconMenu
            title={t('dashboard.aria.socialMenu')}
            placement="top"
            label={
                <div className={style.menuLogo}>
                    <LocalFireDepartmentIcon color="inherit" />
                </div>
            }
        >
            <IconMenuItem tooltip={t('dashboard.labels.heatmapUsers')}>
                <IconButton
                    color={'inherit'}
                    onClick={onOpenUserList}
                    data-testid="heatmap-menu-openusers"
                    aria-label={t('dashboard.labels.heatmapUsers')}
                >
                    <GroupIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.invertHeatmap')}>
                <IconButton
                    color={'inherit'}
                    onClick={onRefresh}
                    data-testid="heatmap-menu-invert"
                    aria-label={t('dashboard.labels.invertHeatmap')}
                >
                    <InvertColorsIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.refresh')}>
                <IconButton
                    color={'inherit'}
                    onClick={onRefresh}
                    data-testid="heatmap-menu-refresh"
                    aria-label={t('dashboard.labels.refresh')}
                >
                    <RefreshIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem tooltip={t('dashboard.labels.saveGraphImage')}>
                <IconButton
                    color="inherit"
                    onClick={saveGraph}
                    aria-label={t('dashboard.labels.saveGraphImage')}
                >
                    <DownloadIcon />
                </IconButton>
            </IconMenuItem>
        </IconMenu>
    );
}
