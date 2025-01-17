import { useServices } from '@genaism/hooks/services';
import Simulation from '@genaism/services/simulation/Simulation';
import { Button } from '@knicos/genai-base';
import { Dialog, DialogActions, DialogContent, DialogTitle, Slider } from '@mui/material';
import { useTranslation } from 'react-i18next';
import style from './style.module.css';
import { useState } from 'react';

interface Props {
    open: boolean;
    onClose: () => void;
    onSimulation: (simulation: Simulation) => void;
}

export default function SimulatorDialog({ onSimulation, open, onClose }: Props) {
    const { recommender, actionLog } = useServices();
    const { t } = useTranslation();
    const [count, setCount] = useState(20);

    const createSim = () => {
        // recommender.profiler.reset();
        const sim = new Simulation(recommender, actionLog);
        sim.createAgents(count, {
            thresholds: { min: 0.1, max: 0.7 },
        });
        onSimulation(sim);
    };

    return (
        <Dialog
            open={open}
            maxWidth="xs"
            fullWidth
            onClose={onClose}
        >
            <DialogTitle>{t('dashboard.titles.simulator')}</DialogTitle>
            <DialogContent>
                <div
                    id="sim-count-label"
                    className={style.label}
                    style={{ marginTop: '1rem' }}
                >
                    {t('dashboard.labels.agentCount')}
                </div>
                <Slider
                    aria-labelledby="sim-count-label"
                    value={count}
                    onChange={(_, value) => setCount(value as number)}
                    min={1}
                    max={100}
                    step={1}
                    valueLabelDisplay="auto"
                />
            </DialogContent>
            <DialogActions>
                <Button
                    variant="contained"
                    onClick={createSim}
                >
                    {t('dashboard.actions.simulate')}
                </Button>
                <Button onClick={onClose}>{t('dashboard.actions.close')}</Button>
            </DialogActions>
        </Dialog>
    );
}
