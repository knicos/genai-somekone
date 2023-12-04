import { atom } from 'recoil';

export const menuShowShare = atom<boolean>({
    key: 'menushowshare',
    default: false,
});

export const menuShowSave = atom<boolean>({
    key: 'menushowsave',
    default: false,
});

export const menuShowSettings = atom<boolean>({
    key: 'menushowsettings',
    default: false,
});

export const menuShowData = atom<boolean>({
    key: 'menushowdata',
    default: false,
});

export const menuShowProfile = atom<boolean>({
    key: 'menushowprofile',
    default: false,
});

export const menuShowShareProfile = atom<boolean>({
    key: 'menushowshareprofile',
    default: false,
});

export const menuShowFeedActions = atom<boolean>({
    key: 'menushowfeedactions',
    default: true,
});
