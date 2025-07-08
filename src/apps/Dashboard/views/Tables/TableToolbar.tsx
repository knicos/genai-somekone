import {
    ColumnsPanelTrigger,
    ExportCsv,
    FilterPanelTrigger,
    GridFilterListIcon,
    GridViewColumnIcon,
    Toolbar,
    ToolbarButton,
} from '@mui/x-data-grid';
import style from './style.module.css';
import { useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Tooltip } from '@mui/material';
import FileDownloadIcon from '@mui/icons-material/FileDownload';

export default function TableToolbar() {
    const { t } = useTranslation();
    const location = useLocation();
    const title = location.pathname.split('/').pop() || 'Unknown';

    return (
        <Toolbar>
            <div className={style.title}>{t(`tables.titles.${title}`)}</div>
            <Tooltip
                title={t('tables.tooltips.columns')}
                arrow
            >
                <ColumnsPanelTrigger render={<ToolbarButton color="inherit" />}>
                    <GridViewColumnIcon fontSize="small" />
                </ColumnsPanelTrigger>
            </Tooltip>
            <Tooltip
                title={t('tables.tooltips.filter')}
                arrow
            >
                <FilterPanelTrigger render={<ToolbarButton color="inherit" />}>
                    <GridFilterListIcon fontSize="small" />
                </FilterPanelTrigger>
            </Tooltip>
            <div style={{ flexGrow: 1 }} />
            <Tooltip
                title={t('tables.tooltips.export')}
                arrow
            >
                <ExportCsv render={<ToolbarButton color="inherit" />}>
                    <FileDownloadIcon fontSize="small" />
                </ExportCsv>
            </Tooltip>
        </Toolbar>
    );
}
