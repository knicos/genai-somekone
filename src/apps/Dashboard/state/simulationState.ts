import Simulation from '@genaism/services/simulation/Simulation';
import { atom } from 'jotai';

export const currentSimulation = atom<Simulation | null>(null);
