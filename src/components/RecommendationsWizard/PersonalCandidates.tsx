import { configuration, userConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';
import { useEffect } from 'react';
import WizardOption from '../RecommendationsWizard/WizardOption';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

interface Props {
    id: UserNodeId;
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
    const config = useRecoilValue(configuration(id));
    const setConfig = useSetRecoilState(userConfiguration(id));

    useEffect(() => {
        changePage(4);
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
                        setConfig({
                            recommendations: {
                                ...config.recommendations,
                                ...templates[value as CandidateTemplateType],
                            },
                        });
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
