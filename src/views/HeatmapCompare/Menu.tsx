import { useTranslation } from 'react-i18next';
import { IconMenu, IconMenuItem, Spacer } from '@genaism/components/IconMenu';
import style from './style.module.css';
import { IconButton } from '@mui/material';
import GroupIcon from '@mui/icons-material/Group';
import LocalFireDepartmentIcon from '@mui/icons-material/LocalFireDepartment';
import RefreshIcon from '@mui/icons-material/Refresh';
import InvertColorsIcon from '@mui/icons-material/InvertColors';
import DownloadIcon from '@mui/icons-material/Download';
import { useEventEmit } from '@genaism/hooks/events';
import PublicIcon from '@mui/icons-material/Public';
import ImageSearchIcon from '@mui/icons-material/ImageSearch';
import EmojiEmotionsIcon from '@mui/icons-material/EmojiEmotions';

export type HeatmapMode = 'global' | 'engagement' | 'recommendation';

interface Props {
    onOpenUserList: () => void;
    onMode: (mode: HeatmapMode) => void;
    onRefresh: () => void;
    onInvert: () => void;
    inverted?: boolean;
    mode: HeatmapMode;
}

export default function HeatmapMenu({ mode, onMode, onOpenUserList, onRefresh, onInvert, inverted }: Props) {
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
            <IconMenuItem
                tooltip={t('dashboard.labels.heatmapGlobal')}
                selected={mode === 'global'}
            >
                <IconButton
                    color={'inherit'}
                    onClick={() => onMode('global')}
                    data-testid="heatmap-menu-global"
                    aria-label={t('dashboard.labels.heatmapGlobal')}
                >
                    <PublicIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.heatmapEngagement')}
                selected={mode === 'engagement'}
            >
                <IconButton
                    color={'inherit'}
                    onClick={() => onMode('engagement')}
                    data-testid="heatmap-menu-engagement"
                    aria-label={t('dashboard.labels.heatmapEngagement')}
                >
                    <EmojiEmotionsIcon />
                </IconButton>
            </IconMenuItem>
            <IconMenuItem
                tooltip={t('dashboard.labels.heatmapRecommendation')}
                selected={mode === 'recommendation'}
            >
                <IconButton
                    color={'inherit'}
                    onClick={() => onMode('recommendation')}
                    data-testid="heatmap-menu-global"
                    aria-label={t('dashboard.labels.heatmapRecommendation')}
                >
                    <ImageSearchIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem tooltip={t('dashboard.labels.heatmapUsers')}>
                <IconButton
                    color={'inherit'}
                    disabled={mode === 'global'}
                    onClick={onOpenUserList}
                    data-testid="heatmap-menu-openusers"
                    aria-label={t('dashboard.labels.heatmapUsers')}
                >
                    <GroupIcon />
                </IconButton>
            </IconMenuItem>
            <Spacer />
            <IconMenuItem
                tooltip={t('dashboard.labels.invertHeatmap')}
                selected={inverted}
            >
                <IconButton
                    color={'inherit'}
                    onClick={onInvert}
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
