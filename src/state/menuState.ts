import { UserNodeId } from '@genaism/services/graph/graphTypes';
import { atom } from 'recoil';

export const menuShowShare = atom<boolean>({
    key: 'menushowshare',
    default: true,
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

export type GraphTypes = 'social' | 'topic' | 'content' | 'ego' | 'grid';
export const menuGraphType = atom<GraphTypes>({
    key: 'menugraphtype',
    default: 'social',
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

export const menuAllowFeedActions = atom<boolean>({
    key: 'menuallowfeedactions',
    default: false,
});

export const menuShowTools = atom<boolean>({
    key: 'menushowtools',
    default: false,
});

export const menuMainMenu = atom<boolean>({
    key: 'menumainmenu',
    default: true,
});

export const menuShowSocialMenu = atom<boolean>({
    key: 'menusocialmenu',
    default: true,
});

export const menuShowGridMenu = atom<boolean>({
    key: 'menugridmenu',
    default: true,
});

export const menuShowContentTools = atom<boolean>({
    key: 'menucontenttools',
    default: false,
});
