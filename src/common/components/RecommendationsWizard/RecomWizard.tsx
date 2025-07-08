import { Button } from '@genai-fi/base';
import style from './style.module.css';
import { useEffect, useRef, useState } from 'react';
import SlideShow from '../SlideShow/SlideShow';
import CandidateOptions from './CandidateOptions';
import ScoringOptions from './ScoringOptions';
import PersonalCandidates from './PersonalCandidates';
import NonPersonalCandidates from './NonPersonalCandidates';
import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos';
import ArrowBackIosNewIcon from '@mui/icons-material/ArrowBackIosNew';
import Stepper from '../SlideShow/Stepper';
import { IconButton } from '@mui/material';
import CancelIcon from '@mui/icons-material/Cancel';
import CloseIcon from '@mui/icons-material/Close';
import { useTranslation } from 'react-i18next';
import DiversityOptions from './DiversityOptions';
import { UserNodeId } from '@knicos/genai-recom';
import { useAtomValue } from 'jotai';
import { appConfiguration, configuration } from '@genaism/common/state/configState';

interface Props {
    id?: UserNodeId;
    active?: boolean;
    onClose: () => void;
    hideClose?: boolean;
    variant?: 'plain' | 'styled';
}

export default function RecomWizard({ id, active, onClose, hideClose, variant = 'styled' }: Props) {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [height, setHeight] = useState(0);
    const [nextPage, setNextPage] = useState(1);
    const prevPage = useRef([0]);
    const config = useAtomValue(id ? configuration(id) : appConfiguration);

    useEffect(() => {
        if (active) {
            if (config.showCandidateWizard) setPage(1);
            else if (config.showScoringWizard) setPage(4);
            else if (config.showDiversityWizard) setPage(5);
            else setPage(1);
        }
        // Do not depend on config, only change the first time.
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [active]);

    const doSetPage = (p: number) => {
        if (p > page) {
            prevPage.current.push(page);
        }
        setPage(p);
        if (p === 0) onClose();
    };

    return (
        <section
            className={
                variant === 'styled'
                    ? !active
                        ? style.wizardClosed
                        : style.wizard
                    : !active
                      ? style.plainwizardClosed
                      : style.plainwizard
            }
            style={{ height: `${height}px` }}
            data-testid="recom-wizard"
        >
            <SlideShow
                page={page}
                onHeight={setHeight}
                controls={
                    page > 0 ? (
                        <div className={style.wizardControls}>
                            <Button
                                variant="outlined"
                                disabled={page <= 1}
                                color="inherit"
                                onClick={() => doSetPage(prevPage.current.pop() || 0)}
                                startIcon={<ArrowBackIosNewIcon />}
                            >
                                {t('recommendations.actions.back')}
                            </Button>
                            <Stepper
                                steps={[
                                    [0, 1],
                                    config.showCandidateRefinementWizard ? [2, 3] : undefined,
                                    config.showScoringWizard ? [4] : undefined,
                                    config.showDiversityWizard ? [5] : undefined,
                                ].filter((f) => f !== undefined)}
                                page={page}
                            />
                            <Button
                                color="primary"
                                variant="contained"
                                onClick={() => doSetPage(nextPage)}
                                endIcon={nextPage === 0 ? <CloseIcon /> : <ArrowForwardIosIcon />}
                                disabled={nextPage < 0}
                                aria-live="off"
                            >
                                {nextPage === 0
                                    ? t('recommendations.actions.close')
                                    : t('recommendations.actions.continue')}
                            </Button>
                        </div>
                    ) : null
                }
            >
                <div className={style.wizardStartPage}></div>
                <CandidateOptions
                    id={id}
                    changePage={setNextPage}
                />
                <PersonalCandidates
                    id={id}
                    changePage={setNextPage}
                />
                <NonPersonalCandidates
                    id={id}
                    changePage={setNextPage}
                />
                <ScoringOptions
                    id={id}
                    changePage={setNextPage}
                />
                <DiversityOptions
                    id={id}
                    changePage={setNextPage}
                />
            </SlideShow>
            {page > 0 && !hideClose && (
                <IconButton
                    sx={{ position: 'absolute', top: '5px', right: '5px' }}
                    size="small"
                    onClick={() => doSetPage(0)}
                    aria-label={t('recommendations.actions.close')}
                >
                    <CancelIcon
                        htmlColor="#444"
                        fontSize="medium"
                    />
                </IconButton>
            )}
        </section>
    );
}
