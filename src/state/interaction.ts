import { atom } from 'recoil';

export const interactionStatus = atom<boolean>({
    key: 'interactionStatus',
    default: false,
});
