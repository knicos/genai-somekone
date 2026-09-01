import { useAtomValue } from 'jotai';
import { useState } from 'react';
import { featureFlagsAtom } from '../../../../common/state/uiState';
import { Tooltip } from '@mui/material';
import ReportIcon from '@mui/icons-material/Report';
import { useTranslation } from 'react-i18next';
import ReportDialog from '../ReportDialog/ReportDialog';
import { Button } from '@genai-fi/base';
import style from './style.module.css';

export default function ReportButton() {
    const { allowReportProblem } = useAtomValue(featureFlagsAtom);
    const [showReportDialog, setShowReportDialog] = useState(false);
    const { t } = useTranslation();

    return allowReportProblem ? (
        <div className={style.container}>
            <Tooltip
                title={t('dashboard.report.tip')}
                arrow
            >
                <Button
                    variant="outlined"
                    color="inherit"
                    startIcon={<ReportIcon fontSize="small" />}
                    sx={{ fontSize: '0.75rem', marginRight: '1rem' }}
                    onClick={() => setShowReportDialog(true)}
                >
                    {t('dashboard.report.button')}
                </Button>
            </Tooltip>
            {showReportDialog && (
                <ReportDialog
                    open={showReportDialog}
                    onClose={() => setShowReportDialog(false)}
                />
            )}
        </div>
    ) : null;
}
