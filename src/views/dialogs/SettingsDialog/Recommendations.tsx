import { Checkbox, FormControl, FormControlLabel, FormLabel, Radio, RadioGroup } from '@mui/material';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { appConfiguration } from '@genaism/state/settingsState';

export default function RecommendationSettings() {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);

    return (
        <div className={style.column}>
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="demo-radio-buttons-group-label">{t('dashboard.labels.candidates')}</FormLabel>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noTaste || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noTaste: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.useTopicCandidates')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noRandom || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noRandom: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.useRandomCandidates')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noCoengaged || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noCoengaged: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.useCoengagedCandidates')}
                />
            </FormControl>
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="demo-radio-buttons-group-label">{t('dashboard.labels.scoring')}</FormLabel>
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noTasteScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noTasteScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.tasteScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noSharingScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noSharingScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.sharingScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noCoengagementScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noCoengagementScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.coengagementScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noFollowingScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noFollowingScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.followingScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noCommentingScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noCommentingScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.commentingScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noLastSeenScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noLastSeenScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.lastSeenScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noReactionScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noReactionScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.reactionScore')}
                />
                <FormControlLabel
                    control={
                        <Checkbox
                            checked={!(config?.recommendations?.noViewingScore || false)}
                            onChange={(_, checked) =>
                                setConfig((old) => ({
                                    ...old,
                                    recommendations: { ...old.recommendations, noViewingScore: !checked },
                                }))
                            }
                        />
                    }
                    label={t('dashboard.labels.viewingScore')}
                />
            </FormControl>
            <FormControl sx={{ marginTop: '1rem' }}>
                <FormLabel id="demo-radio-buttons-group-label">{t('dashboard.labels.selectionMechanism')}</FormLabel>
                <RadioGroup
                    aria-labelledby="demo-radio-buttons-group-label"
                    defaultValue="image"
                    name="radio-buttons-group"
                    value={config?.recommendations?.selection || 'distribution'}
                    onChange={(_, value) =>
                        setConfig((old) => ({
                            ...old,
                            recommendations: { ...old.recommendations, selection: value as 'distribution' | 'rank' },
                        }))
                    }
                >
                    <FormControlLabel
                        value="rank"
                        control={<Radio />}
                        label={t('dashboard.labels.rankSelection')}
                    />
                    <FormControlLabel
                        value="distribution"
                        control={<Radio />}
                        label={t('dashboard.labels.distributionSelection')}
                    />
                </RadioGroup>
            </FormControl>
        </div>
    );
}
