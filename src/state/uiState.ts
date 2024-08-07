import { atom } from 'recoil';

export const uiDarkMode = atom<boolean>({
    key: 'uiDarkMode',
    default: false,
});
