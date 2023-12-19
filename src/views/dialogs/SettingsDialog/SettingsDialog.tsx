import { menuShowSettings } from '@genaism/state/menuState';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Button } from '@genaism/components/Button/Button';
import SocialGraphSettings from './SocialGraph';
import FeedSettings from './Feed';
import TopicGraphSettings from './TopicGraph';
import GeneralSettings from './General';
import ContentGraphSettings from './ContentGraph';
import RecommendationSettings from './Recommendations';

export default function SettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowSettings);
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
            <DialogContent sx={{ display: 'flex', padding: 0 }}>
                <Tabs
                    value={tabNumber}
                    onChange={(_, value) => setTabNumber(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    orientation="vertical"
                    sx={{ borderRight: '1px solid #008297' }}
                >
                    <Tab label="General" />
                    <Tab label="Feeds" />
                    <Tab label="Recommendations" />
                    <Tab label="Social Graph" />
                    <Tab label="Topic Graph" />
                    <Tab label="Content Graph" />
                </Tabs>
                {tabNumber === 0 && <GeneralSettings />}
                {tabNumber === 1 && <FeedSettings />}
                {tabNumber === 2 && <RecommendationSettings />}
                {tabNumber === 3 && <SocialGraphSettings />}
                {tabNumber === 4 && <TopicGraphSettings />}
                {tabNumber === 5 && <ContentGraphSettings />}
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
