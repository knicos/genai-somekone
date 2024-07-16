import { configuration, userConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';
import { useEffect } from 'react';
import WizardOption from './WizardOption';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    id: UserNodeId;
    changePage: (v: number) => void;
}

type CandidateTemplateType = 'all' | 'popular' | 'random';

type CandidateTemplate = Record<CandidateTemplateType, RecommendationOptions>;

const templates: CandidateTemplate = {
    all: {
        random: 2,
        similarUsers: 0,
        taste: 0,
        coengaged: 0,
        popular: 2,
    },
    random: {
        random: 4,
        similarUsers: 0,
        taste: 0,
        coengaged: 0,
        popular: 0,
    },
    popular: {
        random: 0,
        similarUsers: 0,
        taste: 0,
        coengaged: 0,
        popular: 2,
    },
};

function mapToValue(options: RecommendationOptions): CandidateTemplateType {
    if (options.random > 0 && options.popular > 0) return 'all';
    if (options.popular > 0) return 'popular';
    if (options.random > 0) return 'random';
    return 'all';
}

export default function NonPersonalCandidates({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useRecoilValue(configuration(id));
    const setConfig = useSetRecoilState(userConfiguration(id));

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
                        setConfig({
                            recommendations: {
                                ...config.recommendations,
                                ...templates[value as CandidateTemplateType],
                            },
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
                        label={t('recommendations.labels.candidatePopular')}
                        description={t('recommendations.descriptions.candidatePopular')}
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
