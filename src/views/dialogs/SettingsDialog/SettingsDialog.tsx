import { menuShowSettings } from '@genaism/state/menuState';
import { Checkbox, Dialog, DialogActions, DialogContent, DialogTitle, FormControlLabel, Slider } from '@mui/material';
import { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { Button } from '@genaism/components/Button/Button';
import {
    settingDisplayLabel,
    settingDisplayLines,
    settingLinkDistanceScale,
    settingShowOfflineUsers,
    settingShrinkOfflineUsers,
} from '@genaism/state/settingsState';

export default function SettingsDialog() {
    const { t } = useTranslation();
    const [showDialog, setShowDialog] = useRecoilState(menuShowSettings);
    const [showLines, setShowLines] = useRecoilState(settingDisplayLines);
    const [showLabels, setShowLabels] = useRecoilState(settingDisplayLabel);
    const [showOffline, setShowOffline] = useRecoilState(settingShowOfflineUsers);
    const [shrinkOffline, setShrinkOffline] = useRecoilState(settingShrinkOfflineUsers);
    const [edgeScale, setEdgeScale] = useRecoilState(settingLinkDistanceScale);

    const doClose = useCallback(() => setShowDialog(false), [setShowDialog]);

    const doShowLines = useCallback((e: ChangeEvent<HTMLInputElement>) => setShowLines(e.currentTarget.checked), []);
    const doShowLabels = useCallback((e: ChangeEvent<HTMLInputElement>) => setShowLabels(e.currentTarget.checked), []);
    const doShowOffline = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setShowOffline(e.currentTarget.checked),
        []
    );
    const doShrinkOffline = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setShrinkOffline(e.currentTarget.checked),
        []
    );
    const doEdgeScale = useCallback(
        (_: unknown, value: number | number[]) => setEdgeScale(value as number),
        [setEdgeScale]
    );

    return (
        <Dialog
            open={showDialog}
            onClose={doClose}
        >
            <DialogTitle>{t('dashboard.titles.settings')}</DialogTitle>
            <DialogContent>
                <div className={style.column}>
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showLines}
                                onChange={doShowLines}
                            />
                        }
                        label={t('dashboard.labels.showLines')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showLabels}
                                onChange={doShowLabels}
                            />
                        }
                        label={t('dashboard.labels.showLabels')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showOffline}
                                onChange={doShowOffline}
                            />
                        }
                        label={t('dashboard.labels.showOffline')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={shrinkOffline}
                                onChange={doShrinkOffline}
                            />
                        }
                        label={t('dashboard.labels.shrinkOffline')}
                    />
                    <div className={style.label}>{t('dashboard.labels.edgeScaling')}</div>
                    <Slider
                        value={edgeScale}
                        onChange={doEdgeScale}
                        min={1}
                        max={20}
                        step={1}
                    />
                </div>
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