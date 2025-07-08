import { PrintData } from '@genaism/protocol/printProtocol';
import { atom } from 'jotai';

export const storedPrintData = atom<PrintData | undefined>(undefined);
