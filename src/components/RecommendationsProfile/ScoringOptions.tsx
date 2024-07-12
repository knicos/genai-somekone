import { configuration, userConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import WizardOption from './WizardOption';
import { RecommendationOptions } from '@genaism/services/recommender/recommenderTypes';
import { mapScoring } from './mappings';
import { useEffect } from 'react';
import { UserNodeId } from '@genaism/services/graph/graphTypes';

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
    },
    profile: {
        noTasteScore: false,
        noSharingScore: false,
        noFollowingScore: false,
        noReactionScore: false,
        noViewingScore: false,
        noCoengagementScore: false,
        noCommentingScore: false,
    },
    random: {
        noTasteScore: true,
        noSharingScore: true,
        noFollowingScore: true,
        noReactionScore: true,
        noViewingScore: true,
        noCoengagementScore: true,
        noCommentingScore: true,
    },
    all: {
        noTasteScore: false,
        noSharingScore: false,
        noFollowingScore: false,
        noReactionScore: false,
        noViewingScore: false,
        noCoengagementScore: false,
        noCommentingScore: false,
    },
};

interface Props {
    id: UserNodeId;
    changePage: (v: number) => void;
}

export default function ScoringOptions({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useRecoilValue(configuration(id));
    const setConfig = useSetRecoilState(userConfiguration(id));

    const value = mapScoring(config.recommendations);

    useEffect(() => {
        changePage(0);
    }, [value, changePage]);

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
                        setConfig({
                            recommendations: {
                                ...config.recommendations,
                                ...templates[value as ScoringTemplateType],
                            },
                        });
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
                        disabled={true}
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
                        disabled={true}
                        label={t('recommendations.labels.scoringAll')}
                        description={t('recommendations.descriptions.scoringAll')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
