import {
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    Select,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Alert,
} from '@mui/material';
import { useRef, useState } from 'react';
import { Button } from '@genai-fi/base';
import { useTranslation } from 'react-i18next';

interface Props {
    open: boolean;
    onClose: () => void;
    message?: string;
    alertText?: string;
}

export default function ReportDialog({ open, onClose }: Props) {
    const { t } = useTranslation();
    const textRef = useRef<HTMLInputElement>(null);
    const selectRef = useRef<HTMLSelectElement>(null);
    const [hadError, setHadError] = useState(false);
    const [hasSent, setHasSent] = useState(false);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            maxWidth="sm"
        >
            <DialogTitle>{t('dashboard.report.title')}</DialogTitle>
            <DialogContent
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '1rem',
                    paddingTop: '1rem !important',
                    width: '300px',
                }}
            >
                {hadError && <Alert severity="error">{t('dashboard.report.error')}</Alert>}
                <FormControl fullWidth>
                    <InputLabel htmlFor="report-reason-label">{t('dashboard.report.reason')}</InputLabel>
                    <Select
                        inputRef={selectRef}
                        labelId="report-reason-label"
                        defaultValue="bug"
                        label={t('dashboard.report.reason')}
                    >
                        <MenuItem value="bug">{t('dashboard.report.bug')}</MenuItem>
                        <MenuItem value="feedback">{t('dashboard.report.feedback')}</MenuItem>
                        <MenuItem value="other">{t('dashboard.report.other')}</MenuItem>
                    </Select>
                </FormControl>
                <TextField
                    inputRef={textRef}
                    label={t('dashboard.report.message')}
                    fullWidth
                    multiline
                    rows={4}
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={onClose}
                >
                    {t('dashboard.report.cancel')}
                </Button>
                <Button
                    variant="contained"
                    disabled={hasSent}
                    onClick={() => {
                        const reportText = textRef.current?.value;
                        const reportReason = selectRef.current?.value;
                        if (reportText && reportReason && reportText.trim() !== '') {
                            setHasSent(true);
                            const severity = reportReason === 'bug' ? 'error' : 'info';
                            const truncatedReportText =
                                reportText.length > 4000 ? reportText.slice(0, 4000) : reportText;
                            fetch(`${import.meta.env.VITE_APP_API}/report`, {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json',
                                },
                                body: JSON.stringify({
                                    message: truncatedReportText,
                                    application: 'somekone',
                                    severity,
                                }),
                            })
                                .catch((error) => {
                                    console.error('Failed to send report:', error);
                                    setHadError(true);
                                })
                                .then((response) => {
                                    if (response && response.ok) {
                                        setHadError(false);
                                        onClose();
                                    } else {
                                        setHadError(true);
                                    }
                                });
                        }
                    }}
                >
                    {t('dashboard.report.send')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
