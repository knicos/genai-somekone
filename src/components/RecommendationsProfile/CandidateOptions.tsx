import { configuration, userConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';
import { mapPersonalisation } from './mappings';
import { useEffect } from 'react';
import WizardOption from './WizardOption';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    id: UserNodeId;
    changePage: (v: number) => void;
}

type CandidateTemplateType = 'both' | 'personal' | 'nonpersonal';

type CandidateTemplate = Record<CandidateTemplateType, RecommendationOptions>;

const templates: CandidateTemplate = {
    both: {
        random: 2,
        similarUsers: 2,
        taste: 2,
        coengaged: 2,
    },
    personal: {
        random: 0,
        similarUsers: 2,
        taste: 2,
        coengaged: 2,
    },
    nonpersonal: {
        random: 4,
        similarUsers: 0,
        taste: 0,
        coengaged: 0,
    },
};

export default function CandidateOptions({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useRecoilValue(configuration(id));
    const setConfig = useSetRecoilState(userConfiguration(id));

    const value = mapPersonalisation(config.recommendations);

    useEffect(() => {
        changePage(value === 'personal' ? 2 : value === 'nonpersonal' ? 3 : 4);
    }, [value, changePage]);

    return (
        <section
            className={style.wizardPage}
            data-testid="recom-candidate-options"
        >
            <header>
                <h2>{t('recommendations.titles.candidateDiscovery')}</h2>
            </header>
            <div className={style.buttonList}>
                <RadioGroup
                    sx={{ gap: '0.5rem' }}
                    aria-label=""
                    defaultValue="both"
                    name="radio-buttons-group"
                    value={value}
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
                        selected={value === 'personal'}
                        value="personal"
                        label={t('recommendations.labels.candidatePersonal')}
                        description={t('recommendations.descriptions.candidatePersonal')}
                    />
                    <WizardOption
                        selected={value === 'nonpersonal'}
                        value="nonpersonal"
                        label={t('recommendations.labels.candidateNonPersonal')}
                        description={t('recommendations.descriptions.candidateNonPersonal')}
                    />
                    <WizardOption
                        selected={value === 'both'}
                        value="both"
                        label={t('recommendations.labels.candidatePersonalAndNon')}
                        description={t('recommendations.descriptions.candidatePersonalAndNon')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
