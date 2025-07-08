import { menuShowSimulator } from '@genaism/apps/Dashboard/state/menuState';
import { useEffect, useState } from 'react';
import { useAtom, useAtomValue } from 'jotai';
import SimulatorDialog from './SimulatorDialog';
import { appConfiguration } from '@genaism/common/state/configState';
import SimulatorStatus from './SimulatorStatus';
import { currentSimulation } from '@genaism/apps/Dashboard/state/simulationState';

export default function Simulator() {
    const [simulation, setSimulation] = useAtom(currentSimulation);
    const [open, setOpen] = useAtom(menuShowSimulator);
    const appConfig = useAtomValue(appConfiguration);
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
