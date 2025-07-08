import { appConfiguration, configuration, userConfiguration } from '@genaism/common/state/configState';
import { useTranslation } from 'react-i18next';
import { useAtomValue, useSetAtom } from 'jotai';
import style from './style.module.css';
import { RadioGroup } from '@mui/material';
import WizardOption from './WizardOption';
import { useEffect } from 'react';
import { UserNodeId } from '@knicos/genai-recom';

interface Props {
    id?: UserNodeId;
    changePage: (v: number) => void;
}

export default function DiversityOptions({ id, changePage }: Props) {
    const { t } = useTranslation();
    const config = useAtomValue(id ? configuration(id) : appConfiguration);
    const setConfig = useSetAtom(userConfiguration(id || 'user:none'));
    const setGlobalConfig = useSetAtom(appConfiguration);

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
                        if (id) {
                            setConfig({
                                recommendations: {
                                    ...config.recommendations,
                                    selection: value as 'rank' | 'distribution',
                                },
                            });
                        } else {
                            setGlobalConfig((cfg) => ({
                                ...cfg,
                                recommendations: {
                                    ...cfg.recommendations,
                                    selection: value as 'rank' | 'distribution',
                                },
                            }));
                        }
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
