import Simulation from '@genaism/services/simulation/Simulation';
import { menuShowSimulator } from '@genaism/state/menuState';
import { useEffect, useState } from 'react';
import { useRecoilState, useRecoilValue } from 'recoil';
import SimulatorDialog from './SimulatorDialog';
import { appConfiguration } from '@genaism/state/settingsState';
import SimulatorStatus from './SimulatorStatus';

export default function Simulator() {
    const [simulation, setSimulation] = useState<Simulation | null>(null);
    const [open, setOpen] = useRecoilState(menuShowSimulator);
    const appConfig = useRecoilValue(appConfiguration);
    const [progress, setProgress] = useState(0);
    const [running, setRunning] = useState(false);

    useEffect(() => {
        if (simulation) {
            setProgress(0);
            setRunning(true);
            simulation.simulate({
                duration: 100,
                tick: 1000,
                ...appConfig.recommendations,
                onTick: (step) => {
                    setProgress(step);
                },
                onEnd: () => {
                    setRunning(false);
                },
            });
            return () => {
                simulation.stop();
            };
        }
    }, [simulation, appConfig]);

    return (
        <>
            <SimulatorDialog
                open={open}
                onClose={() => setOpen(false)}
                onSimulation={setSimulation}
            />
            {running && <SimulatorStatus progress={progress / 100} />}
        </>
    );
}
