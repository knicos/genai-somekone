import { PrintData } from '@genaism/protocol/printProtocol';
import { atom } from 'recoil';

export const storedPrintData = atom<PrintData | undefined>({
    key: 'storedprintdata',
    default: undefined,
});
