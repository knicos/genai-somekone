import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { atom } from 'recoil';

export const settingDisplayLines = atom<boolean>({
    key: 'settingdisplaylines',
    default: true,
});

export const settingDisplayLabel = atom<boolean>({
    key: 'settingdisplaylabel',
    default: true,
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

export type NodeDisplayMode = 'image' | 'word' | 'score';

export const settingNodeMode = atom<NodeDisplayMode>({
    key: 'settingnodemode',
    default: 'image',
});

export const appConfiguration = atom<SMConfig>({
    key: 'appconfig',
    default: {},
});

export const settingTopicDisplayLines = atom<boolean>({
    key: 'settingtopicdisplaylines',
    default: true,
});

export const settingTopicLinkDistanceScale = atom<number>({
    key: 'settingtopiclinkdistscale',
    default: 6,
});

export const settingTopicSimilarPercent = atom<number>({
    key: 'settingtopicsimilarpercent',
    default: 0.2,
});

export const settingTopicNodeCharge = atom<number>({
    key: 'settingtopicnodecharge',
    default: 2,
});

export const settingClusterColouring = atom<boolean>({
    key: 'settingclustercolouring',
    default: false,
});

export const settingEgoOnSelect = atom<boolean>({
    key: 'settingegoonselect',
    default: true,
});
