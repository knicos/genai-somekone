import { SocialGraphThemes } from '@genaism/visualisations/SocialGraph/graphTheme';
import { SMConfig } from '@genaism/state/smConfig';
import { UserNodeId } from '@knicos/genai-recom';
import { atom, atomFamily, selectorFamily } from 'recoil';

/* === General === */

export const appConfiguration = atom<SMConfig>({
    key: 'appconfig',
    default: undefined,
});

export const userConfiguration = atomFamily<Partial<SMConfig>, UserNodeId>({
    key: 'userconfig',
    default: undefined,
});

export const configuration = selectorFamily<SMConfig, UserNodeId>({
    key: 'configuration',
    get:
        (id: UserNodeId) =>
        ({ get }) => ({ ...get(appConfiguration), ...get(userConfiguration(id)) }),
});

/* === Social Graph === */

export const settingSocialGraphScale = atom<number>({
    key: 'settingSocialGraphScale',
    default: 1,
});

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
    default: false,
});

export const settingSocialGraphTheme = atom<SocialGraphThemes>({
    key: 'settingsocialgraphtheme',
    default: 'default',
});

/*export const settingLinkDistanceScale = atom<number>({
    key: 'settinglinkdistscale',
    default: 200,
});*/

export const settingSimilarPercent = atom<number>({
    key: 'settingsimilarpercent',
    default: 0.1,
});

export const settingLinkLimit = atom<number>({
    key: 'settinglinklimit',
    default: 5,
});

/*export const settingTopicThreshold = atom<number>({
    key: 'settingtopicthreshold',
    default: 0.4,
});*/

export const settingShrinkOfflineUsers = atom<boolean>({
    key: 'settingshrinkofflineusers',
    default: false,
});

export const settingShowOfflineUsers = atom<boolean>({
    key: 'settingshowofflineusers',
    default: true,
});

export type NodeDisplayMode = 'image' | 'word' | 'score' | 'profileImage';

export const settingNodeMode = atom<NodeDisplayMode>({
    key: 'settingnodemode',
    default: 'image',
});

export const settingClusterColouring = atom<number>({
    key: 'settingclustercolouring',
    default: 0,
});

export const settingEgoOnSelect = atom<boolean>({
    key: 'settingegoonselect',
    default: true,
});

export const settingSocialSelectAction = atom<boolean>({
    key: 'settingselectaction',
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
