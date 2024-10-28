import { menuSettingsDialog } from '@genaism/state/menuState';
import { Dialog, DialogContent, DialogTitle, IconButton } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import RecomWizard from '@genaism/components/RecommendationsWizard/RecomWizard';
import CloseIcon from '@mui/icons-material/Close';

export default function RecomSettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuSettingsDialog);

    const doClose = useCallback(() => setShowDialog('none'), [setShowDialog]);

    return (
        <Dialog
            open={showDialog === 'recommendation'}
            onClose={doClose}
            scroll="paper"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{t('settings.titles.app')}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={doClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <RecomWizard
                    active
                    onClose={doClose}
                    hideClose
                    variant="plain"
                />
            </DialogContent>
        </Dialog>
    );
}
