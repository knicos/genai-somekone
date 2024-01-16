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

type GraphTypes = 'social' | 'topic' | 'content' | 'ego' | 'grid';
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
