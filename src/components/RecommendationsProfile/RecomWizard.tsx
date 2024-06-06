import { Button } from '../Button/Button';
import style from './style.module.css';
import DesignServicesIcon from '@mui/icons-material/DesignServices';
import { useRef, useState } from 'react';
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

export default function RecomWizard() {
    const { t } = useTranslation();
    const [page, setPage] = useState(0);
    const [height, setHeight] = useState(0);
    const [nextPage, setNextPage] = useState(1);
    const prevPage = useRef([0]);

    const doSetPage = (p: number) => {
        if (p > page) {
            prevPage.current.push(page);
        }
        setPage(p);
    };

    return (
        <section
            className={page === 0 ? style.wizardClosed : style.wizard}
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
                                steps={[[0, 1], [2, 3], [4]]}
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
                <div className={style.wizardStartPage}>
                    <Button
                        onClick={() => setPage(1)}
                        variant="outlined"
                        color="secondary"
                        startIcon={<DesignServicesIcon />}
                        data-testid="start-recom-wizard"
                    >
                        {t('recommendations.actions.change')}
                    </Button>
                </div>
                <CandidateOptions changePage={setNextPage} />
                <PersonalCandidates changePage={setNextPage} />
                <NonPersonalCandidates changePage={setNextPage} />
                <ScoringOptions changePage={setNextPage} />
            </SlideShow>
            {page > 0 && (
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
