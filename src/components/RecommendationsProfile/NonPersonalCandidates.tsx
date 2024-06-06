import { appConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';
import { useEffect } from 'react';
import WizardOption from './WizardOption';

interface Props {
    changePage: (v: number) => void;
}

type CandidateTemplateType = 'all' | 'taste' | 'users' | 'coengaged' | 'random';

type CandidateTemplate = Record<CandidateTemplateType, RecommendationOptions>;

const templates: CandidateTemplate = {
    all: {
        random: 2,
        similarUsers: 2,
        taste: 2,
        coengaged: 2,
    },
    taste: {
        random: 0,
        similarUsers: 0,
        taste: 4,
        coengaged: 0,
    },
    users: {
        random: 0,
        similarUsers: 4,
        taste: 0,
        coengaged: 0,
    },
    coengaged: {
        random: 0,
        similarUsers: 0,
        taste: 0,
        coengaged: 4,
    },
    random: {
        random: 4,
        similarUsers: 0,
        taste: 0,
        coengaged: 0,
    },
};

function mapToValue(options: RecommendationOptions): CandidateTemplateType {
    if (options.random > 0 && options.taste > 0 && options.coengaged > 0 && options.similarUsers > 0) return 'all';
    if (options.taste > 0) return 'taste';
    if (options.similarUsers > 0) return 'users';
    if (options.coengaged > 0) return 'coengaged';
    if (options.random > 0) return 'random';
    return 'all';
}

export default function NonPersonalCandidates({ changePage }: Props) {
    const { t } = useTranslation();
    const [config, setConfig] = useRecoilState(appConfiguration);

    useEffect(() => {
        changePage(4);
    }, [config, changePage]);

    return (
        <section className={style.wizardPage}>
            <header>
                <h2>{t('recommendations.titles.candidatesNonPersonal')}</h2>
            </header>
            <div className={style.buttonList}>
                <RadioGroup
                    aria-label=""
                    defaultValue="image"
                    sx={{ gap: '0.5rem' }}
                    name="radio-buttons-group"
                    value={mapToValue(config.recommendations)}
                    onChange={(_, value: string) => {
                        setConfig((old) => {
                            return {
                                ...old,
                                recommendations: {
                                    ...old.recommendations,
                                    ...templates[value as CandidateTemplateType],
                                },
                            };
                        });
                    }}
                >
                    <WizardOption
                        value="random"
                        label={t('recommendations.labels.candidateRandom')}
                        description={t('recommendations.descriptions.candidateRandom')}
                    />
                    <WizardOption
                        value="popular"
                        disabled={true}
                        label={t('recommendations.labels.candidatePopular')}
                        description={t('recommendations.descriptions.candidatePopular')}
                    />
                    <WizardOption
                        value="recent"
                        disabled={true}
                        label={t('recommendations.labels.candidateRecent')}
                        description={t('recommendations.descriptions.candidateRecent')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
