import { configuration, userConfiguration } from '@genaism/state/settingsState';
import { useTranslation } from 'react-i18next';
import { useRecoilValue, useSetRecoilState } from 'recoil';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import WizardOption from '../RecommendationsWizard/WizardOption';
import { useEffect } from 'react';
import { UserNodeId } from '@knicos/genai-recom';

interface Props {
    id: UserNodeId;
    changePage: (v: number) => void;
}

export default function DiversityOptions({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useRecoilValue(configuration(id));
    const setConfig = useSetRecoilState(userConfiguration(id));

    const value = config.recommendations.selection;

    useEffect(() => {
        changePage(0);
    }, [value, changePage]);

    return (
        <section className={style.wizardPage}>
            <header>
                <h2>{t('recommendations.titles.diversityOptions')}</h2>
            </header>
            <div className={style.buttonList}>
                <RadioGroup
                    sx={{ gap: '0.5rem' }}
                    aria-label=""
                    defaultValue="both"
                    name="radio-buttons-group"
                    value={value || 'distribution'}
                    onChange={(_, value: string) => {
                        setConfig({
                            recommendations: {
                                ...config.recommendations,
                                selection: value as 'rank' | 'distribution',
                            },
                        });
                    }}
                >
                    <WizardOption
                        selected={value === 'distribution'}
                        value="distribution"
                        label={t('recommendations.labels.selectionProbability')}
                        description={t('recommendations.descriptions.selectionProbability')}
                    />
                    <WizardOption
                        selected={value === 'rank'}
                        value="rank"
                        label={t('recommendations.labels.selectionRank')}
                        description={t('recommendations.descriptions.selectionRank')}
                    />
                </RadioGroup>
            </div>
        </section>
    );
}
