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
    settingAutoCamera,
    settingAutoEdges,
    settingDisplayLabel,
    settingDisplayLines,
    settingEgoOnSelect,
    settingIncludeAllLinks,
    settingLinkLimit,
    settingSimilarPercent,
    settingSocialGraphScale,
    settingSocialGraphTheme,
} from '@genaism/apps/Dashboard/state/settingsState';
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
    const [similarity, setSimilarity] = useRecoilState(settingSimilarPercent);
    const [limit, setLimit] = useRecoilState(settingLinkLimit);
    const [autoCamera, setAutoCamera] = useRecoilState(settingAutoCamera);
    const [autoEdges, setAutoEdges] = useRecoilState(settingAutoEdges);

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
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={autoCamera}
                                onChange={(_, checked) => setAutoCamera(checked)}
                            />
                        }
                        label={t('dashboard.labels.autoCamera')}
                    />
                    <FormControlLabel
                        control={
                            <Checkbox
                                checked={autoEdges}
                                onChange={(_, checked) => setAutoEdges(checked)}
                            />
                        }
                        label={t('dashboard.labels.autoEdges')}
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
                        valueLabelDisplay="auto"
                    />
                    <div
                        id="social-similarity-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.similarityThreshold')}
                    </div>
                    <Slider
                        aria-labelledby="social-similarity-label"
                        value={similarity}
                        onChange={(_: unknown, value: number | number[]) => setSimilarity(value as number)}
                        min={0.01}
                        max={0.5}
                        step={0.01}
                        valueLabelDisplay="auto"
                        disabled={autoEdges}
                    />
                    <div
                        id="social-limit-label"
                        className={style.label}
                    >
                        {t('dashboard.labels.limitLinks')}
                    </div>
                    <Slider
                        aria-labelledby="social-limit-label"
                        value={limit}
                        onChange={(_: unknown, value: number | number[]) => setLimit(value as number)}
                        min={1}
                        max={10}
                        step={1}
                        valueLabelDisplay="auto"
                    />
                </div>
            </DialogContent>
        </Dialog>
    );
}
