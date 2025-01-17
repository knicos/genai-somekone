import Simulation from '@genaism/services/simulation/Simulation';
import { atom } from 'recoil';

export const currentSimulation = atom<Simulation | null>({
    key: 'simulation',
    default: null,
    dangerouslyAllowMutability: true,
});
