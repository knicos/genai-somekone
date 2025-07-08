import { menuShowSettings } from '@genaism/apps/Dashboard/state/menuState';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useAtom } from 'jotai';
import { Button } from '@genai-fi/base';
import FeedSettings from './Feed';
import GeneralSettings from './General';
import RecommendationSettings from './Recommendations';
import VisualisationSettings from './Visualisation';
import FlowSettings from './Flow';

export default function SettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useAtom(menuShowSettings);
    const [tabNumber, setTabNumber] = useState(0);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    return (
        <Dialog
            open={showDialog}
            onClose={doClose}
            scroll="paper"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle>{t('dashboard.titles.settings')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <Tabs
                    value={tabNumber}
                    onChange={(_, value) => setTabNumber(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    orientation="vertical"
                    sx={{ borderRight: '1px solid #008297' }}
                >
                    <Tab label={t('dashboard.titles.general')} />
                    <Tab label={t('dashboard.titles.feedApp')} />
                    <Tab label={t('dashboard.titles.flowApp')} />
                    <Tab label={t('dashboard.titles.recommendations')} />
                    <Tab label={t('settings.titles.visualisation')} />
                </Tabs>
                {tabNumber === 0 && <GeneralSettings />}
                {tabNumber === 1 && <FeedSettings />}
                {tabNumber === 2 && <FlowSettings />}
                {tabNumber === 3 && <RecommendationSettings />}
                {tabNumber === 4 && <VisualisationSettings />}
            </DialogContent>
            <DialogActions>
                <Button
                    variant="outlined"
                    onClick={doClose}
                >
                    {t('dashboard.actions.close')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
