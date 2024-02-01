import { SMConfig } from '@genaism/views/Genagram/smConfig';
import { atom } from 'recoil';

/* === General === */

export const appConfiguration = atom<SMConfig>({
    key: 'appconfig',
    default: undefined,
});

/* === Social Graph === */

export const settingDisplayLines = atom<boolean>({
    key: 'settingdisplaylines',
    default: true,
});

export const settingDisplayLabel = atom<boolean>({
    key: 'settingdisplaylabel',
    default: true,
});

export const settingIncludeAllLinks = atom<boolean>({
    key: 'settingalllinks',
    default: true,
});

export const settingLinkDistanceScale = atom<number>({
    key: 'settinglinkdistscale',
    default: 4,
});

export const settingSimilarPercent = atom<number>({
    key: 'settingsimilarpercent',
    default: 0.2,
});

export const settingNodeCharge = atom<number>({
    key: 'settingnodecharge',
    default: 3,
});

export const settingTopicThreshold = atom<number>({
    key: 'settingtopicthreshold',
    default: 0.5,
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

export const settingClusterColouring = atom<boolean>({
    key: 'settingclustercolouring',
    default: false,
});

export const settingEgoOnSelect = atom<boolean>({
    key: 'settingegoonselect',
    default: true,
});

/* === Topic Graph === */

export const settingTopicDisplayLines = atom<boolean>({
    key: 'settingtopicdisplaylines',
    default: true,
});

export const settingTopicLinkDistanceScale = atom<number>({
    key: 'settingtopiclinkdistscale',
    default: 3,
});

export const settingTopicSimilarPercent = atom<number>({
    key: 'settingtopicsimilarpercent',
    default: 0.2,
});

export const settingTopicNodeCharge = atom<number>({
    key: 'settingtopicnodecharge',
    default: 5,
});

/* === Content Grap === */

export const settingContentDisplayLines = atom<boolean>({
    key: 'settingcontentdisplaylines',
    default: true,
});

export const settingContentLinkDistanceScale = atom<number>({
    key: 'settingcontentlinkdistscale',
    default: 1,
});

export const settingContentSimilarPercent = atom<number>({
    key: 'settingcontentsimilarpercent',
    default: 0.2,
});

export const settingContentNodeCharge = atom<number>({
    key: 'settingcontentnodecharge',
    default: 2,
});
