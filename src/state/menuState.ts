import { UserNodeId } from '@knicos/genai-recom';
import { atom } from 'recoil';

export const menuShowShare = atom<boolean>({
    key: 'menushowshare',
    default: true,
});

export const menuShowSave = atom<boolean>({
    key: 'menushowsave',
    default: false,
});

export type SettingsDialogs = 'none' | 'app' | 'recommendation';
export const menuSettingsDialog = atom<SettingsDialogs>({
    key: 'menusettingsdialog',
    default: 'none',
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

export const menuShowRecommendations = atom<boolean>({
    key: 'menushowrecommendations',
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

export const menuSelectedUser = atom<UserNodeId | undefined>({
    key: 'menuselecteduser',
    default: undefined,
});

export type UserPanel = 'none' | 'feed' | 'data' | 'profile' | 'recommendations';
export const menuShowUserPanel = atom<UserPanel>({
    key: 'menushowuserpanel',
    default: 'none',
});

export const menuNodeSelectAction = atom<UserPanel>({
    key: 'menuselectaction',
    default: 'none',
});

export const menuShowReplay = atom<boolean>({
    key: 'menushowreplay',
    default: false,
});

export const menuShowReplayControls = atom<boolean>({
    key: 'menushowreplaycontrols',
    default: true,
});

export const menuReplaySpeed = atom<number>({
    key: 'menureplayspeed',
    default: 16,
});

export const menuAllowFeedActions = atom<boolean>({
    key: 'menuallowfeedactions',
    default: false,
});

export const menuShowTools = atom<boolean>({
    key: 'menushowtools',
    default: false,
});

export const menuShowSimulator = atom<boolean>({
    key: 'menushowsimulator',
    default: false,
});

export const menuMainMenu = atom<boolean>({
    key: 'menumainmenu',
    default: true,
});

export const menuTreeMenu = atom<boolean>({
    key: 'menutreemenu',
    default: true,
});

export const menuDisabledTreeItems = atom<string[]>({
    key: 'menudisabledtree',
    default: [],
});

export const menuShowSocialMenu = atom<boolean>({
    key: 'menusocialmenu',
    default: true,
});

export const menuShowGridMenu = atom<boolean>({
    key: 'menugridmenu',
    default: true,
});

export const menuHideGridMenuActions = atom<boolean>({
    key: 'menugridmenuactions',
    default: false,
});

export const menuHideGridMenuContent = atom<boolean>({
    key: 'menugridmenucontent',
    default: false,
});
