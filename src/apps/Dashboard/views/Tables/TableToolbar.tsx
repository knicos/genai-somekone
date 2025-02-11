import {
    GridToolbarColumnsButton,
    GridToolbarContainer,
    GridToolbarExport,
    GridToolbarFilterButton,
} from '@mui/x-data-grid';
import style from './style.module.css';
import { useLocation } from 'react-router';
import { useTranslation } from 'react-i18next';

export default function TableToolbar() {
    const { t } = useTranslation();
    const location = useLocation();
    const title = location.pathname.split('/').pop() || 'Unknown';

    return (
        <GridToolbarContainer>
            <div className={style.title}>{t(`tables.titles.${title}`)}</div>
            <GridToolbarColumnsButton slotProps={{ button: { color: 'inherit' }, tooltip: { arrow: true } }} />
            <GridToolbarFilterButton slotProps={{ button: { color: 'inherit' }, tooltip: { arrow: true } }} />
            <div style={{ flexGrow: 1 }} />
            <GridToolbarExport slotProps={{ button: { color: 'inherit' }, tooltip: { arrow: true } }} />
        </GridToolbarContainer>
    );
}
