import { Checkbox, FormControlLabel, Slider } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import {
    settingTopicDisplayLines,
    settingTopicLinkDistanceScale,
    settingTopicNodeCharge,
    settingTopicSimilarPercent,
} from '@genaism/apps/Dashboard/state/settingsState';

export default function TopicGraphSettings() {
    const { t } = useTranslation();
    const [showLines, setShowLines] = useRecoilState(settingTopicDisplayLines);
    const [edgeScale, setEdgeScale] = useRecoilState(settingTopicLinkDistanceScale);
    const [similarPercent, setSimilarPercent] = useRecoilState(settingTopicSimilarPercent);
    const [nodeCharge, setNodeCharge] = useRecoilState(settingTopicNodeCharge);

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
                        onChange={(_, checked) => setShowLines(checked)}
                    />
                }
                label={t('dashboard.labels.showLines')}
            />
            <div
                id="topic-edge-scaling-label"
                className={style.label}
            >
                {t('dashboard.labels.edgeScaling')}
            </div>
            <Slider
                aria-labelledby="topic-edge-scaling-label"
                value={edgeScale}
                onChange={doEdgeScale}
                min={1}
                max={20}
                step={1}
            />
            <div
                id="topic-similar-percent-label"
                className={style.label}
            >
                {t('dashboard.labels.similarPercent')}
            </div>
            <Slider
                aria-labelledby="topic-similar-percent-label"
                value={similarPercent}
                onChange={doSimilarPercent}
                min={0}
                max={1}
                step={0.1}
            />
            <div
                id="topic-node-charge-label"
                className={style.label}
            >
                {t('dashboard.labels.nodeCharge')}
            </div>
            <Slider
                aria-labelledby="topic-node-charge-label"
                value={nodeCharge}
                onChange={doNodeCharge}
                min={0}
                max={10}
                step={0.5}
            />
        </div>
    );
}
