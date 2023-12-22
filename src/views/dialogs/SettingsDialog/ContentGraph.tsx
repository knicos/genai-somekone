import { Checkbox, FormControlLabel, Slider } from '@mui/material';
import { ChangeEvent, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import {
    settingContentDisplayLines,
    settingContentLinkDistanceScale,
    settingContentNodeCharge,
    settingContentSimilarPercent,
} from '@genaism/state/settingsState';

export default function ContentGraphSettings() {
    const { t } = useTranslation();
    const [showLines, setShowLines] = useRecoilState(settingContentDisplayLines);
    const [edgeScale, setEdgeScale] = useRecoilState(settingContentLinkDistanceScale);
    const [similarPercent, setSimilarPercent] = useRecoilState(settingContentSimilarPercent);
    const [nodeCharge, setNodeCharge] = useRecoilState(settingContentNodeCharge);

    const doShowLines = useCallback(
        (e: ChangeEvent<HTMLInputElement>) => setShowLines(e.currentTarget.checked),
        [setShowLines]
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
