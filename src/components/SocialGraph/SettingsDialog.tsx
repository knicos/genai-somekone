import {
    Dialog,
    DialogContent,
    DialogTitle,
    FormControl,
    IconButton,
    InputLabel,
    MenuItem,
    Select,
} from '@mui/material';
import { Checkbox, FormControlLabel, Slider } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import {
    settingDisplayLabel,
    settingDisplayLines,
    settingEgoOnSelect,
    settingIncludeAllLinks,
    settingSocialGraphScale,
    settingSocialGraphTheme,
} from '@genaism/state/settingsState';
import CloseIcon from '@mui/icons-material/Close';
import { SocialGraphThemes } from './graphTheme';

interface Props {
    open: boolean;
    onClose: () => void;
}

export default function SocialSettingsDialog({ open, onClose }: Props) {
    const { t } = useTranslation();
    const [showLines, setShowLines] = useRecoilState(settingDisplayLines);
    const [showLabels, setShowLabels] = useRecoilState(settingDisplayLabel);
    const [scale, setScale] = useRecoilState(settingSocialGraphScale);
    const [egoSelect, setEgoSelect] = useRecoilState(settingEgoOnSelect);
    const [allLinks, setAllLinks] = useRecoilState(settingIncludeAllLinks);
    const [graphTheme, setGraphTheme] = useRecoilState(settingSocialGraphTheme);

    const doScale = useCallback((_: unknown, value: number | number[]) => setScale(value as number), [setScale]);

    return (
        <Dialog
            open={open}
            onClose={onClose}
            scroll="paper"
            maxWidth="xs"
            fullWidth
        >
            <DialogTitle>{t('dashboard.titles.socialGraph')}</DialogTitle>
            <IconButton
                aria-label="close"
                onClick={onClose}
                sx={{
                    position: 'absolute',
                    right: 8,
                    top: 8,
                    color: (theme) => theme.palette.grey[500],
                }}
            >
                <CloseIcon />
            </IconButton>
            <DialogContent>
                <div className={style.column}>
                    <FormControl fullWidth>
                        <InputLabel id="sg-theme-select">{t('dashboard.labels.theme')}</InputLabel>
                        <Select
                            labelId="sg-theme-select"
                            value={graphTheme}
                            label={t('dashboard.labels.theme')}
                            onChange={(e) => setGraphTheme(e.target.value as SocialGraphThemes)}
                        >
                            <MenuItem value="default">{t('dashboard.labels.themeDefault')}</MenuItem>
                            <MenuItem value="highContrast">{t('dashboard.labels.themeHighContrast')}</MenuItem>
                        </Select>
                    </FormControl>
                    <div className={style.spacer} />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showLines}
                                onChange={(_, checked) => setShowLines(checked)}
                            />
                        }
                        label={t('dashboard.labels.showLines')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={showLabels}
                                onChange={(_, checked) => setShowLabels(checked)}
                            />
                        }
                        label={t('dashboard.labels.showLabels')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={egoSelect}
                                onChange={(_, checked) => setEgoSelect(checked)}
                            />
                        }
                        label={t('dashboard.labels.egoSelect')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={allLinks}
                                onChange={(_, checked) => setAllLinks(checked)}
                            />
                        }
                        label={t('dashboard.labels.allLinks')}
                    />
                    <div className={style.spacer} />
                    <div
                        id="social-edge-scaling-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.edgeScaling')}
                    </div>
                    <Slider
                        aria-labelledby="social-edge-scaling-label"
                        value={scale}
                        onChange={doScale}
                        min={0.1}
                        max={2}
                        step={0.1}
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
