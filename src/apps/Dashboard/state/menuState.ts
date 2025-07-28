import { UserNodeId } from '@genai-fi/recom';
import { atom } from 'jotai';

export const menuShowShare = atom<boolean>(true);

export type SettingsDialogs = 'none' | 'app' | 'recommendation';
export const menuSettingsDialog = atom<SettingsDialogs>('none');

export const menuShowSettings = atom<boolean>(false);

export const menuShowData = atom<boolean>(false);

export const menuShowProfile = atom<boolean>(false);

export const menuShowRecommendations = atom<boolean>(false);

export const menuShowShareProfile = atom<boolean>(false);

export const menuShowFeedActions = atom<boolean>(true);

export const menuSelectedUser = atom<UserNodeId | undefined>(undefined);

export type UserPanel = 'none' | 'feed' | 'data' | 'profile' | 'recommendations';
export const menuShowUserPanel = atom<UserPanel>('none');

export const menuNodeSelectAction = atom<UserPanel>('none');

export const menuShowReplay = atom<boolean>(false);

export const menuShowReplayControls = atom<boolean>(true);

export const menuReplaySpeed = atom<number>(16);

export const menuAllowFeedActions = atom<boolean>(false);

export const menuShowTools = atom<boolean>(false);

export const menuShowSimulator = atom<boolean>(false);

export const menuMainMenu = atom<boolean>(true);

export const menuTreeMenu = atom<boolean>(true);

export const menuDisabledTreeItems = atom<string[]>([]);

export const menuShowSocialMenu = atom<boolean>(true);

export const menuShowGridMenu = atom<boolean>(true);

export const menuHideGridMenuActions = atom<boolean>(false);

export const menuHideGridMenuContent = atom<boolean>(false);
