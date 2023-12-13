import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Slider } from '@mui/material';
import { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import {
    NodeDisplayMode,
    settingClusterColouring,
    settingDisplayLabel,
    settingDisplayLines,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingNodeMode,
    settingShowOfflineUsers,
    settingShrinkOfflineUsers,
    settingSimilarPercent,
} from '@genaism/state/settingsState';

export default function SocialGraphSettings() {
    const { t } = useTranslation();
    const [showLines, setShowLines] = useRecoilState(settingDisplayLines);
    const [showLabels, setShowLabels] = useRecoilState(settingDisplayLabel);
    const [showOffline, setShowOffline] = useRecoilState(settingShowOfflineUsers);
    const [shrinkOffline, setShrinkOffline] = useRecoilState(settingShrinkOfflineUsers);
    const [edgeScale, setEdgeScale] = useRecoilState(settingLinkDistanceScale);
    const [similarPercent, setSimilarPercent] = useRecoilState(settingSimilarPercent);
    const [nodeCharge, setNodeCharge] = useRecoilState(settingNodeCharge);
    const [nodeMode, setNodeMode] = useRecoilState(settingNodeMode);
    const [clusterColouring, setClusterColouring] = useRecoilState(settingClusterColouring);

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
    const doSimilarPercent = useCallback(
        (_: unknown, value: number | number[]) => setSimilarPercent(value as number),
        [setSimilarPercent]
    );
    const doNodeCharge = useCallback(
        (_: unknown, value: number | number[]) => setNodeCharge(value as number),
        [setNodeCharge]
    );

    return (
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
            <FormControlLabel
                control={
                    <Checkbox
                        checked={clusterColouring}
                        onChange={(_, checked) => setClusterColouring(checked)}
                    />
                }
                label={t('dashboard.labels.clusterColouring')}
            />
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="demo-radio-buttons-group-label">{t('dashboard.labels.nodeContents')}</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="image"
                    name="radio-buttons-group"
                    value={nodeMode}
                    onChange={(_, value) => setNodeMode(value as NodeDisplayMode)}
                >
                    <FormControlLabel
                        value="image"
                        control={<Radio />}
                        label={t('dashboard.labels.engagedImages')}
                    />
                    <FormControlLabel
                        value="word"
                        control={<Radio />}
                        label={t('dashboard.labels.topicCloud')}
                    />
                    <FormControlLabel
                        value="score"
                        control={<Radio />}
                        label={t('dashboard.labels.engagementScore')}
                    />
                </RadioGroup>
            </FormControl>
            <div className={style.label}>{t('dashboard.labels.edgeScaling')}</div>
            <Slider
                value={edgeScale}
                onChange={doEdgeScale}
                min={1}
                max={20}
                step={1}
            />
            <div className={style.label}>{t('dashboard.labels.similarPercent')}</div>
            <Slider
                value={similarPercent}
                onChange={doSimilarPercent}
                min={0}
                max={1}
                step={0.1}
            />
            <div className={style.label}>{t('dashboard.labels.nodeCharge')}</div>
            <Slider
                value={nodeCharge}
                onChange={doNodeCharge}
                min={0}
                max={10}
                step={0.5}
            />
        </div>
    );
}
