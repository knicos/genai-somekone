import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup, Slider } from '@mui/material';
import { useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import {
    NodeDisplayMode,
    settingClusterColouring,
    settingDisplayLabel,
    settingDisplayLines,
    settingEgoOnSelect,
    settingIncludeAllLinks,
    settingLinkDistanceScale,
    settingNodeCharge,
    settingNodeMode,
    settingShowOfflineUsers,
    settingShrinkOfflineUsers,
    settingSimilarPercent,
    settingTopicThreshold,
} from '@genaism/state/settingsState';
import { UserPanel, menuAllowFeedActions, menuNodeSelectAction } from '@genaism/state/menuState';

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
    const [egoSelect, setEgoSelect] = useRecoilState(settingEgoOnSelect);
    const [topicThreshold, setTopicThreshold] = useRecoilState(settingTopicThreshold);
    const [allLinks, setAllLinks] = useRecoilState(settingIncludeAllLinks);
    const [allowActions, setAllowActions] = useRecoilState(menuAllowFeedActions);
    const [selectMode, setSelectMode] = useRecoilState(menuNodeSelectAction);

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
    const doTopicThreshold = useCallback(
        (_: unknown, value: number | number[]) => setTopicThreshold(value as number),
        [setTopicThreshold]
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
                        checked={showOffline}
                        onChange={(_, checked) => setShowOffline(checked)}
                    />
                }
                label={t('dashboard.labels.showOffline')}
            />
            <FormControlLabel
                control={
                    <Checkbox
                        checked={shrinkOffline}
                        onChange={(_, checked) => setShrinkOffline(checked)}
                    />
                }
                label={t('dashboard.labels.shrinkOffline')}
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
                        checked={allowActions}
                        onChange={(_, checked) => setAllowActions(checked)}
                    />
                }
                label={t('dashboard.labels.allowFeedActions')}
            />
            <div className={style.spacer} />
            <div
                id="cluster-colouring-label"
                className={style.label}
            >
                {t('dashboard.labels.clusterColouring')}
            </div>
            <Slider
                aria-labelledby="cluster-colouring-label"
                value={clusterColouring}
                onChange={(_, value) => setClusterColouring(value as number)}
                style={{ marginBottom: '40px' }}
                min={0}
                max={6}
                step={null}
                marks={[
                    { value: 0, label: t('dashboard.labels.none') },
                    { value: 2, label: '2' },
                    { value: 3, label: '3' },
                    { value: 4, label: '4' },
                    { value: 5, label: '5' },
                    { value: 6, label: '6' },
                ]}
            />
            <div className={style.spacer} />
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
                    <FormControlLabel
                        value="profileImage"
                        control={<Radio />}
                        label={t('dashboard.labels.profileImage')}
                    />
                </RadioGroup>
            </FormControl>
            <div className={style.spacer} />
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="node-select-group-label">{t('dashboard.labels.nodeSelect')}</FormLabel>
                <RadioGroup
                    aria-labelledby="node-select-group-label"
                    defaultValue="none"
                    name="node-select-group"
                    value={selectMode}
                    onChange={(_, value) => setSelectMode(value as UserPanel)}
                >
                    <FormControlLabel
                        value="none"
                        control={<Radio />}
                        label={t('dashboard.labels.noActionOnSelect')}
                    />
                    <FormControlLabel
                        value="feed"
                        control={<Radio />}
                        label={t('dashboard.labels.showFeed')}
                    />
                    <FormControlLabel
                        value="data"
                        control={<Radio />}
                        label={t('dashboard.labels.showData')}
                    />
                    <FormControlLabel
                        value="profile"
                        control={<Radio />}
                        label={t('dashboard.labels.showProfile')}
                    />
                    <FormControlLabel
                        value="recommendations"
                        control={<Radio />}
                        label={t('dashboard.labels.showRecommendations')}
                    />
                </RadioGroup>
            </FormControl>
            <div className={style.spacer} />
            <div
                id="social-edge-scaling-label"
                className={style.label}
            >
                {t('dashboard.labels.edgeScaling')}
            </div>
            <Slider
                aria-labelledby="social-edge-scaling-label"
                value={edgeScale}
                onChange={doEdgeScale}
                min={1}
                max={20}
                step={1}
            />
            <div
                id="social-similar-percent-label"
                className={style.label}
            >
                {t('dashboard.labels.similarPercent')}
            </div>
            <Slider
                aria-labelledby="social-similar-percent-label"
                value={similarPercent}
                onChange={doSimilarPercent}
                min={0}
                max={0.05}
                step={0.001}
            />
            <div
                id="social-node-charge-label"
                className={style.label}
            >
                {t('dashboard.labels.nodeCharge')}
            </div>
            <Slider
                aria-labelledby="social-node-charge-label"
                value={nodeCharge}
                onChange={doNodeCharge}
                min={0}
                max={10}
                step={0.5}
            />
            <div
                id="social-topic-threshold-label"
                className={style.label}
            >
                {t('dashboard.labels.topicThreshold')}
            </div>
            <Slider
                aria-labelledby="social-topic-threshold-label"
                value={topicThreshold}
                onChange={doTopicThreshold}
                min={0}
                max={1}
                step={0.1}
            />
        </div>
    );
}
