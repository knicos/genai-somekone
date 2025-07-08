import { appConfiguration, configuration, userConfiguration } from '@genaism/common/state/configState';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import WizardOption from './WizardOption';
import { mapScoring } from './mappings';
import { useEffect } from 'react';
import { RecommendationOptions, UserNodeId } from '@knicos/genai-recom';

type ScoringTemplateType = 'all' | 'profile' | 'noprofile' | 'random';

type ScoringTemplate = Record<ScoringTemplateType, Partial<RecommendationOptions>>;

const templates: ScoringTemplate = {
    noprofile: {
        noTasteScore: true,
        noSharingScore: true,
        noFollowingScore: true,
        noReactionScore: true,
        noViewingScore: true,
        noCoengagementScore: true,
        noCommentingScore: true,
        noPopularity: false,
    },
    profile: {
        noTasteScore: false,
        noSharingScore: false,
        noFollowingScore: false,
        noReactionScore: false,
        noViewingScore: false,
        noCoengagementScore: false,
        noCommentingScore: false,
        noPopularity: true,
    },
    random: {
        noTasteScore: true,
        noSharingScore: true,
        noFollowingScore: true,
        noReactionScore: true,
        noViewingScore: true,
        noCoengagementScore: true,
        noCommentingScore: true,
        noPopularity: true,
    },
    all: {
        noTasteScore: false,
        noSharingScore: false,
        noFollowingScore: false,
        noReactionScore: false,
        noViewingScore: false,
        noCoengagementScore: false,
        noCommentingScore: false,
        noPopularity: false,
    },
};

interface Props {
    id?: UserNodeId;
    changePage: (v: number) => void;
}

export default function ScoringOptions({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useAtomValue(id ? configuration(id) : appConfiguration);
    const setConfig = useSetAtom(userConfiguration(id || 'user:none'));
    const setGlobalConfig = useSetAtom(appConfiguration);

    const value = mapScoring(config.recommendations);

    useEffect(() => {
        if (config.showDiversityWizard) {
            changePage(5);
        } else {
            changePage(0);
        }
    }, [config, value, changePage]);

    return (
        <section className={style.wizardPage}>
            <header>
                <h2>{t('recommendations.titles.scoringOptions')}</h2>
            </header>
            <div className={style.buttonList}>
                <RadioGroup
                    sx={{ gap: '0.5rem' }}
                    aria-label=""
                    defaultValue="both"
                    name="radio-buttons-group"
                    value={value}
                    onChange={(_, value: string) => {
                        if (id) {
                            setConfig({
                                recommendations: {
                                    ...config.recommendations,
                                    ...templates[value as ScoringTemplateType],
                                },
                            });
                        } else {
                            setGlobalConfig((cfg) => ({
                                ...cfg,
                                recommendations: {
                                    ...cfg.recommendations,
                                    ...templates[value as ScoringTemplateType],
                                },
                            }));
                        }
                    }}
                >
                    <WizardOption
                        selected={value === 'profile'}
                        value="profile"
                        label={t('recommendations.labels.scoringPredict')}
                        description={t('recommendations.descriptions.scoringPredict')}
                    />
                    <WizardOption
                        selected={value === 'noprofile'}
                        value="noprofile"
                        label={t('recommendations.labels.scoringGeneral')}
                        description={t('recommendations.descriptions.scoringGeneral')}
                    />
                    <WizardOption
                        selected={value === 'random'}
                        value="random"
                        label={t('recommendations.labels.scoringRandom')}
                        description={t('recommendations.descriptions.scoringRandom')}
                    />
                    <WizardOption
                        selected={value === 'all'}
                        value="all"
                        label={t('recommendations.labels.scoringAll')}
                        description={t('recommendations.descriptions.scoringAll')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
