import { ContentInjectReason, UserEntry } from '@genaism/protocol/protocol';
import { UserInfo } from '@genaism/common/state/userInfo';
import { ContentNodeId, UserNodeId } from '@knicos/genai-recom';
import { atom } from 'recoil';

const USERNAME_KEY = 'genai_somekone_username';

function loadUser() {
    const name = window.sessionStorage.getItem(USERNAME_KEY);
    return name || undefined;
}

export const availableUsers = atom<UserEntry[]>({
    key: 'availableUsers',
    default: [],
});

export const onlineUsers = atom<UserInfo[]>({
    key: 'onlineUsers',
    default: [],
    dangerouslyAllowMutability: true,
});

export const currentUserName = atom<string | undefined>({
    key: 'currentUserName',
    default: loadUser(),
});

export const contentLoaded = atom<boolean>({
    key: 'contentLoaded',
    default: false,
});

export interface InjectContentType {
    to: UserNodeId;
    from?: UserNodeId;
    reason: ContentInjectReason;
    content: ContentNodeId;
    timestamp: number;
}

export const injectedContent = atom<InjectContentType[]>({
    key: 'injectcontent',
    default: [],
});
