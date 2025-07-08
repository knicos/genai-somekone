import { menuSettingsDialog } from '@genaism/apps/Dashboard/state/menuState';
import { Dialog, DialogContent, DialogTitle, IconButton, Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';

import CloseIcon from '@mui/icons-material/Close';
import FeedSettings from './FeedSettings';
import MenuSettings from './MenuSettings';
import RecomSettings from './RecomSettings';

export default function AppSettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useAtom(menuSettingsDialog);
    const [tabNumber, setTabNumber] = useState(0);

    const doClose = useCallback(() => setShowDialog('none'), [setShowDialog]);

    return (
        <Dialog
            open={showDialog === 'app'}
            onClose={doClose}
            scroll="paper"
            maxWidth="sm"
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
            <DialogContent sx={{ padding: 0, maxHeight: '600px' }}>
                <Tabs
                    value={tabNumber}
                    onChange={(_, value) => setTabNumber(value)}
                >
                    <Tab label={t('settings.titles.feed')} />
                    <Tab label={t('settings.titles.appmenu')} />
                    <Tab label={t('settings.titles.recom')} />
                </Tabs>
                {tabNumber === 0 && <FeedSettings />}
                {tabNumber === 1 && <MenuSettings />}
                {tabNumber === 2 && <RecomSettings />}
            </DialogContent>
        </Dialog>
    );
}
