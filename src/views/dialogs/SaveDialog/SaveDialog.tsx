import { menuShowSave } from '@genaism/state/menuState';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState, useRecoilValue } from 'recoil';
import style from './style.module.css';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { Button } from '@genaism/components/Button/Button';
import { saveFile } from '@genaism/services/saver/fileSaver';
import { appConfiguration } from '@genaism/state/settingsState';

export default function SaveDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowSave);
    const [saveContent, setSaveContent] = useState(false);
    const [saveProfiles, setSaveProfiles] = useState(false);
    const [saveLogs, setSaveLogs] = useState(true);
    const [saveGraph, setSaveGraph] = useState(true);
    const appConfig = useRecoilValue(appConfiguration);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    const doSave = useCallback(() => {
        saveFile({
            includeContent: saveContent,
            includeProfiles: saveProfiles,
            includeLogs: saveLogs,
            includeGraph: saveGraph,
            configuration: appConfig,
        });
        setShowDialog(false);
    }, [setShowDialog, saveContent, saveProfiles, saveLogs, saveGraph, appConfig]);

    return (
        <Dialog
            open={showDialog}
            onClose={doClose}
        >
            <DialogTitle>{t('dashboard.titles.save')}</DialogTitle>
            <DialogContent>
                <div className={style.column}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveContent}
                                onChange={(_, checked) => setSaveContent(checked)}
                            />
                        }
                        label={t('dashboard.labels.saveContent')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveProfiles}
                                onChange={(_, checked) => setSaveProfiles(checked)}
                            />
                        }
                        label={t('dashboard.labels.saveProfiles')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveLogs}
                                onChange={(_, checked) => setSaveLogs(checked)}
                            />
                        }
                        label={t('dashboard.labels.saveActions')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveGraph}
                                onChange={(_, checked) => setSaveGraph(checked)}
                            />
                        }
                        label={t('dashboard.labels.saveGraph')}
                    />
                </div>
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    startIcon={<SaveAltIcon />}
                    onClick={doSave}
                >
                    {t('dashboard.actions.save')}
                </Button>
                <Button
                    variant="outlined"
                    onClick={doClose}
                >
                    {t('dashboard.actions.cancel')}
                </Button>
            </DialogActions>
        </Dialog>
    );
}
