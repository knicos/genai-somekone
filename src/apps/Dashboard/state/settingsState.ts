import { SocialGraphThemes } from '@genaism/apps/Dashboard/visualisations/SocialGraph/graphTheme';
import { atom } from 'jotai';

/* === General === */

export type AppType = 'feed' | 'flow' | 'profile';
export const userApp = atom<AppType>('feed');

/* === Guidance === */

export const guideFile = atom<File | null>(null);

/* === Heatmaps === */

export const heatmapAutoUsers = atom<number>(0);

export const heatmapDimension = atom<number>(0);

export type HeatmapMode = 'global' | 'engagement' | 'recommendation';
export const heatmapMode = atom<HeatmapMode>('global');

/* === Social Graph === */

export const settingSocialGraphScale = atom<number>(1);

export const settingDisplayLines = atom<boolean>(true);

export const settingDisplayLabel = atom<boolean>(true);

export const settingIncludeAllLinks = atom<boolean>(false);

export const settingSocialGraphTheme = atom<SocialGraphThemes>('default');

export const settingSimilarPercent = atom<number>(0.1);

export const settingLinkLimit = atom<number>(5);

export const settingAutoCamera = atom<boolean>(false);

export const settingAutoEdges = atom<boolean>(true);

export const settingShrinkOfflineUsers = atom<boolean>(false);

export const settingShowOfflineUsers = atom<boolean>(true);

export type NodeDisplayMode = 'image' | 'word' | 'score' | 'profileImage';

export const settingNodeMode = atom<NodeDisplayMode>('image');

export const settingClusterColouring = atom<number>(0);

export const settingEgoOnSelect = atom<boolean>(true);

export const settingSocialSelectAction = atom<boolean>(true);

export const settingSocialNodeMenu = atom<boolean>(true);

/* === Topic Graph === */

export const settingTopicDisplayLines = atom<boolean>(true);

export const settingTopicLinkDistanceScale = atom<number>(3);

export const settingTopicSimilarPercent = atom<number>(0.2);

export const settingTopicNodeCharge = atom<number>(5);

/* === Content Graph === */

export const settingContentDisplayLines = atom<boolean>(true);

export const settingContentLinkDistanceScale = atom<number>(1);

export const settingContentSimilarPercent = atom<number>(0.2);

export const settingContentNodeCharge = atom<number>(2);

/* === Content Wizard === */

export const settingContentWizardAdvanced = atom<boolean>(false);
