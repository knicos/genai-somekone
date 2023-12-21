import { UserNodeId } from '@genaism/services/graph/graphTypes';
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

type GraphTypes = 'social' | 'topic' | 'content' | 'ego';
export const menuGraphType = atom<GraphTypes>({
    key: 'menugraphtype',
    default: 'social',
});

export const menuShowFeed = atom<UserNodeId | undefined>({
    key: 'menushowfeed',
    default: undefined,
});

export const menuShowUserData = atom<UserNodeId | undefined>({
    key: 'menushowuserdata',
    default: undefined,
});

export const menuShowUserProfile = atom<UserNodeId | undefined>({
    key: 'menushowuserprofile',
    default: undefined,
});
