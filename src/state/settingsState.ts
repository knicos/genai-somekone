import { atom } from 'recoil';

export const settingDisplayLines = atom<boolean>({
    key: 'settingdisplaylines',
    default: true,
});

export const settingDisplayLabel = atom<boolean>({
    key: 'settingdisplaylabel',
    default: false,
});

export const settingLinkDistanceScale = atom<number>({
    key: 'settinglinkdistscale',
    default: 6,
});

export const settingSimilarPercent = atom<number>({
    key: 'settingsimilarpercent',
    default: 0.2,
});

export const settingNodeCharge = atom<number>({
    key: 'settingnodecharge',
    default: 2,
});

export const settingShrinkOfflineUsers = atom<boolean>({
    key: 'settingshrinkofflineusers',
    default: false,
});

export const settingShowOfflineUsers = atom<boolean>({
    key: 'settingshowofflineusers',
    default: true,
});

type NodeDisplayMode = 'image' | 'word' | 'score';

export const settingNodeMode = atom<NodeDisplayMode>({
    key: 'settingnodemode',
    default: 'image',
});
