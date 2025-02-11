import { useMemo } from 'react';
import style from './style.module.css';

interface Props {
    steps: number[][];
    page: number;
}

export default function Stepper({ steps, page }: Props) {
    const stepMap = useMemo(() => {
        const newMap = new Map<number, number>();
        if (steps) {
            steps.forEach((s, ix) => {
                s.forEach((p) => {
                    newMap.set(p, ix);
                });
            });
        }
        return newMap;
    }, [steps]);

    const step = stepMap.get(page) || 0;

    return (
        <div className={style.stepper}>
            {Array.from({ length: steps.length }, (_, ix) => (
                <div
                    className={ix === step ? style.activeStep : style.inactiveStep}
                    key={ix}
                />
            ))}
        </div>
    );
}
