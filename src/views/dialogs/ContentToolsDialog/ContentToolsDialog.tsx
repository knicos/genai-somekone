import { menuShowContentTools } from '@genaism/state/menuState';
import { Dialog, DialogActions, DialogContent, DialogTitle, Tab, Tabs } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import { Button } from '@genaism/components/Button/Button';
import RawEmbeddingTool from './RawEmbeddingTool';
import EmbeddingTool from './EmbeddingTool';
import MappingTool from './MappingTool';

export default function ContentToolsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowContentTools);
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
            <DialogTitle>{t('dashboard.titles.contentTools')}</DialogTitle>
            <DialogContent sx={{ display: 'flex', padding: 0, maxHeight: '600px' }}>
                <Tabs
                    value={tabNumber}
                    onChange={(_, value) => setTabNumber(value)}
                    variant="scrollable"
                    scrollButtons="auto"
                    orientation="vertical"
                    sx={{ borderRight: '1px solid #008297' }}
                >
                    <Tab label={t('dashboard.titles.rawEmbeddingTool')} />
                    <Tab label={t('dashboard.titles.embeddingTool')} />
                    <Tab label={t('dashboard.titles.mappingTool')} />
                </Tabs>
                {tabNumber === 0 && <RawEmbeddingTool />}
                {tabNumber === 1 && <EmbeddingTool />}
                {tabNumber === 2 && <MappingTool />}
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
