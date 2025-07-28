import { ContentInjectReason, UserEntry } from '@genaism/protocol/protocol';
import { UserInfo } from '@genaism/common/state/userInfo';
import { ContentNodeId, UserNodeId } from '@genai-fi/recom';
import { atom } from 'jotai';

const USERNAME_KEY = 'genai_somekone_username';

function loadUser() {
    const name = window.sessionStorage.getItem(USERNAME_KEY);
    return name || undefined;
}

export const availableUsers = atom<UserEntry[]>([]);

export const onlineUsers = atom<UserInfo[]>([]);

export const currentUserName = atom<string | undefined>(loadUser());

export const contentLoaded = atom<boolean>(false);

export interface InjectContentType {
    to: UserNodeId;
    from?: UserNodeId;
    reason: ContentInjectReason;
    content: ContentNodeId;
    timestamp: number;
}

export const injectedContent = atom<InjectContentType[]>([]);
