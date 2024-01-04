import { atom } from 'recoil';

export const interactionStatus = atom<boolean>({
    key: 'interactionStatus',
    default: false,
});

export const unsavedChanges = atom<boolean>({
    key: 'unsavedChanges',
    default: false,
});
