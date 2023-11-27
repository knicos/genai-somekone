import { menuShowSave } from '@genaism/state/menuState';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel } from '@mui/material';
import { ChangeEvent, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import SaveAltIcon from '@mui/icons-material/SaveAlt';
import { Button } from '@genaism/components/Button/Button';
import { saveFile } from '@genaism/services/saver/fileSaver';

export default function SaveDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowSave);
    const [saveContent, setSaveContent] = useState(false);
    const [saveProfiles, setSaveProfiles] = useState(true);
    const [saveLogs, setSaveLogs] = useState(true);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    const doSaveContent = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSaveContent(e.currentTarget.checked);
    }, []);

    const doSaveProfiles = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSaveProfiles(e.currentTarget.checked);
    }, []);

    const doSaveLogs = useCallback((e: ChangeEvent<HTMLInputElement>) => {
        setSaveLogs(e.currentTarget.checked);
    }, []);
    const doSave = useCallback(() => {
        saveFile(saveContent, saveProfiles, saveLogs);
        setShowDialog(false);
    }, [setShowDialog, saveContent, saveProfiles]);

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
                                disabled={true}
                                checked={saveContent}
                                onChange={doSaveContent}
                            />
                        }
                        label={t('dashboard.labels.saveContent')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveProfiles}
                                onChange={doSaveProfiles}
                            />
                        }
                        label={t('dashboard.labels.saveProfiles')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={saveLogs}
                                onChange={doSaveLogs}
                            />
                        }
                        label={t('dashboard.labels.saveProfiles')}
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
