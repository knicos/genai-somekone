import { appConfiguration, configuration, userConfiguration } from '@genaism/common/state/configState';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import { useEffect } from 'react';
import WizardOption from './WizardOption';
import { RecommendationOptions, UserNodeId } from '@genai-fi/recom';

interface Props {
    id?: UserNodeId;
    changePage: (v: number) => void;
}

type CandidateTemplateType = 'all' | 'taste' | 'users' | 'coengaged';

type CandidateTemplate = Record<CandidateTemplateType, RecommendationOptions>;

const templates: CandidateTemplate = {
    all: {
        random: 0,
        similarUsers: 2,
        taste: 2,
        coengaged: 2,
        popular: 0,
    },
    taste: {
        random: 0,
        similarUsers: 0,
        taste: 4,
        coengaged: 0,
        popular: 0,
    },
    users: {
        random: 0,
        similarUsers: 4,
        taste: 0,
        coengaged: 0,
        popular: 0,
    },
    coengaged: {
        random: 0,
        similarUsers: 0,
        taste: 0,
        coengaged: 4,
        popular: 0,
    },
};

function mapToValue(options: RecommendationOptions): CandidateTemplateType {
    if (options.taste > 0 && options.coengaged > 0 && options.similarUsers > 0) return 'all';
    if (options.taste > 0) return 'taste';
    if (options.similarUsers > 0) return 'users';
    if (options.coengaged > 0) return 'coengaged';
    return 'all';
}

export default function PersonalCandidates({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useAtomValue(id ? configuration(id) : appConfiguration);
    const setConfig = useSetAtom(userConfiguration(id || 'user:none'));
    const setGlobalConfig = useSetAtom(appConfiguration);

    useEffect(() => {
        if (config.showScoringWizard) {
            changePage(4);
        } else if (config.showDiversityWizard) {
            changePage(5);
        } else {
            changePage(0);
        }
    }, [config, changePage]);

    return (
        <section className={style.wizardPage}>
            <header>
                <h2>{t('recommendations.titles.candidatesPersonal')}</h2>
            </header>
            <div className={style.buttonList}>
                <RadioGroup
                    aria-label=""
                    sx={{ gap: '0.5rem' }}
                    defaultValue="image"
                    name="radio-buttons-group"
                    value={mapToValue(config.recommendations)}
                    onChange={(_, value: string) => {
                        if (id) {
                            setConfig({
                                recommendations: {
                                    ...config.recommendations,
                                    ...templates[value as CandidateTemplateType],
                                },
                            });
                        } else {
                            setGlobalConfig((cfg) => ({
                                ...cfg,
                                recommendations: {
                                    ...cfg.recommendations,
                                    ...templates[value as CandidateTemplateType],
                                },
                            }));
                        }
                    }}
                >
                    <WizardOption
                        value="taste"
                        label={t('recommendations.labels.candidateLabels')}
                        description={t('recommendations.descriptions.candidateLabels')}
                    />
                    <WizardOption
                        value="users"
                        label={t('recommendations.labels.candidateUsers')}
                        description={t('recommendations.descriptions.candidateUsers')}
                    />
                    <WizardOption
                        value="coengaged"
                        label={t('recommendations.labels.candidateCoengaged')}
                        description={t('recommendations.descriptions.candidateCoengaged')}
                    />
                    <WizardOption
                        value="all"
                        label={t('recommendations.labels.candidateAll')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
